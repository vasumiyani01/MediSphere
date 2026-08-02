import os
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.conf import settings
from accounts.models import UserProfile

def citizen_dashboard(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('/')
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'citizen':
            dest = 'pharmacies' if profile.user_type == 'pharmacy' else f'{profile.user_type}s'
            return redirect(f'/{dest}/')
    except UserProfile.DoesNotExist:
        return redirect('/')
    
    return render(request, 'citizens/dashboard.html')

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from accounts.views import log_activity

@csrf_protect
def update_citizen_profile(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
        
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'citizen':
            return JsonResponse({'success': False, 'error': 'Access denied: not a citizen'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
        
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        mobile_number = data.get('mobile_number', '').strip()
        email = data.get('email', '').strip()
        address = data.get('address', '').strip()
        city = data.get('city', '').strip()
        state = data.get('state', '').strip()
        pincode = data.get('pincode', '').strip()
        age = data.get('age')
        gender = data.get('gender', '').strip()
        
        try:
            age = int(age)
        except (ValueError, TypeError):
            return JsonResponse({'success': False, 'error': 'Age must be a valid number'}, status=400)
            
        if not (name and mobile_number and email and address and city and state and pincode and age and gender):
            return JsonResponse({'success': False, 'error': 'All fields are required to complete your profile'}, status=400)
            
        if UserProfile.objects.filter(mobile_number=mobile_number).exclude(id=profile.id).exists():
            return JsonResponse({'success': False, 'error': 'Mobile number is already in use.'}, status=400)
            
        if UserProfile.objects.filter(email=email).exclude(id=profile.id).exists():
            return JsonResponse({'success': False, 'error': 'Email is already in use.'}, status=400)
            
        profile.name = name
        profile.mobile_number = mobile_number
        profile.email = email
        profile.address = address
        profile.city = city
        profile.state = state
        profile.pincode = pincode
        profile.age = age
        profile.gender = gender
        profile.save()
        
        log_activity(request, profile.email, "Citizen profile completed/updated")
        
        return JsonResponse({
            'success': True,
            'message': 'Profile completed successfully',
            'user': {
                'name': profile.name,
                'mobile_number': profile.mobile_number,
                'email': profile.email,
                'address': profile.address,
                'city': profile.city,
                'state': profile.state,
                'pincode': profile.pincode,
                'age': profile.age,
                'gender': profile.gender
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


def public_medicines_list(request):
    try:
        from medicines.models import Medicine
        from django.db import connection

        user_id = request.session.get('user_id')
        citizen_pincode = None

        if user_id:
            try:
                citizen = UserProfile.objects.get(id=user_id)
                citizen_pincode = citizen.pincode
            except UserProfile.DoesNotExist:
                pass

        # If citizen has a pincode, filter medicines by pharmacy inventory in that pincode
        if citizen_pincode:
            # Find all pharmacy user_ids with matching pincode
            pharmacy_ids = list(
                UserProfile.objects.filter(
                    user_type='pharmacy',
                    is_approved=True,
                    pincode=citizen_pincode
                ).values_list('id', flat=True)
            )

            if not pharmacy_ids:
                return JsonResponse({'success': True, 'medicines': [], 'pincode': citizen_pincode, 'pharmacy_count': 0})

            cursor = connection.cursor()
            placeholders = ','.join(['%s'] * len(pharmacy_ids))
            cursor.execute(f"""
                SELECT
                    m.id, m.name, m.manufacturer, m.category, m.pack_size,
                    m.uses, m.side_effects, m.image_url,
                    MIN(inv.price) as price,
                    SUM(inv.stock) as total_stock,
                    GROUP_CONCAT(DISTINCT u.name) as pharmacy_names,
                    GROUP_CONCAT(DISTINCT inv.user_id) as pharmacy_ids
                FROM inventory inv
                JOIN medicines m ON inv.medicine_id = m.id
                JOIN users u ON inv.user_id = u.id
                WHERE inv.user_id IN ({placeholders})
                  AND inv.stock > 0
                GROUP BY m.id
                ORDER BY m.name
            """, pharmacy_ids)

            rows = cursor.fetchall()
            medicine_data = []
            for r in rows:
                medicine_data.append({
                    'id': r[0],
                    'name': r[1],
                    'manufacturer': r[2],
                    'category': r[3],
                    'pack_size': r[4],
                    'uses': r[5],
                    'side_effects': r[6] or '',
                    'image_url': r[7] or '',
                    'price': r[8],
                    'total_stock': r[9],
                    'pharmacy_names': r[10] or '',
                    'pharmacy_ids': r[11] or ''
                })

            return JsonResponse({
                'success': True,
                'medicines': medicine_data,
                'pincode': citizen_pincode,
                'pharmacy_count': len(pharmacy_ids)
            })
        else:
            # Fallback: show all medicines if pincode not set
            medicines = Medicine.objects.all().order_by('name')
            medicine_data = []
            for m in medicines:
                medicine_data.append({
                    'id': m.id,
                    'name': m.name,
                    'manufacturer': m.manufacturer,
                    'category': m.category,
                    'pack_size': m.pack_size,
                    'uses': m.uses,
                    'side_effects': m.side_effects,
                    'image_url': m.image_url or '',
                    'price': 0,
                    'total_stock': 0,
                    'pharmacy_names': ''
                })
            return JsonResponse({'success': True, 'medicines': medicine_data, 'pincode': '', 'pharmacy_count': 0})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


def public_diseases_list(request):
    try:
        from diseases.models import Disease
        diseases = Disease.objects.all().order_by('name')
        disease_data = []
        for d in diseases:
            disease_data.append({
                'id': d.id,
                'name': d.name,
                'description': d.description or '',
                'causes': d.causes or '',
                'symptoms': d.symptoms or '',
                'risk_factors': d.risk_factors or '',
                'complications': d.complications or '',
                'treatment': d.treatment or '',
                'medicine': d.medicine or ''
            })
        return JsonResponse({'success': True, 'diseases': disease_data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


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
from django.views.decorators.csrf import csrf_protect, csrf_exempt
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


def public_report_templates(request):
    try:
        from custom_admin.models import Report
        reports = Report.objects.all().order_by('name')
        report_list = []
        for r in reports:
            params = []
            for p in r.parameters.all():
                params.append({
                    'id': p.id,
                    'parameter': p.parameter,
                    'unit': p.unit,
                    'male_min': p.male_min,
                    'male_max': p.male_max,
                    'female_min': p.female_min,
                    'female_max': p.female_max,
                })
            report_list.append({
                'id': r.id,
                'name': r.name,
                'short_name': r.short_name,
                'category': r.category,
                'description': r.description or '',
                'parameters': params,
            })
        return JsonResponse({'success': True, 'reports': report_list})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def citizen_reports_list(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        from .models import CitizenReport
        reports = CitizenReport.objects.filter(user_id=user_id).order_by('-created_at')
        report_list = []
        for r in reports:
            params = []
            for p in r.parameters.all():
                params.append({
                    'id': p.id,
                    'name': p.name,
                    'unit': p.unit,
                    'value': p.value,
                    'min': p.min,
                    'max': p.max,
                    'status': p.status,
                })
            report_list.append({
                'id': r.id,
                'name': r.name,
                'short_name': r.short_name,
                'description': r.description or '',
                'status': r.status,
                'parameters': params,
                'created_at': r.created_at.strftime('%Y-%m-%d %H:%M:%S') if r.created_at else ''
            })
        return JsonResponse({'success': True, 'reports': report_list})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def citizen_report_add(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'}, status=405)
    try:
        import json
        from .models import CitizenReport, CitizenReportParameter
        data = json.loads(request.body)
        
        name = data.get('name', '').strip()
        short_name = data.get('short_name', '').strip()
        description = data.get('description', '').strip()
        status = data.get('status', 'Normal').strip()
        parameters = data.get('parameters', [])

        if not name or not short_name:
            return JsonResponse({'success': False, 'error': 'Name and short name are required'}, status=400)

        report = CitizenReport.objects.create(
            user_id=user_id,
            name=name,
            short_name=short_name,
            description=description,
            status=status
        )

        for p in parameters:
            CitizenReportParameter.objects.create(
                report=report,
                name=p.get('name', '').strip(),
                unit=p.get('unit', '').strip(),
                value=str(p.get('value', '')).strip(),
                min=str(p.get('min', '')).strip(),
                max=str(p.get('max', '')).strip(),
                status=p.get('status', 'Normal').strip()
            )

        return JsonResponse({'success': True, 'message': 'Report saved successfully'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def citizen_report_edit(request, report_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'}, status=405)
    try:
        import json
        from .models import CitizenReport, CitizenReportParameter
        data = json.loads(request.body)

        report = CitizenReport.objects.get(id=report_id, user_id=user_id)
        
        name = data.get('name', '').strip()
        short_name = data.get('short_name', '').strip()
        description = data.get('description', '').strip()
        status = data.get('status', 'Normal').strip()
        parameters = data.get('parameters', [])

        if not name or not short_name:
            return JsonResponse({'success': False, 'error': 'Name and short name are required'}, status=400)

        report.name = name
        report.short_name = short_name
        report.description = description
        report.status = status
        report.save()

        # Re-create parameters
        report.parameters.all().delete()
        for p in parameters:
            CitizenReportParameter.objects.create(
                report=report,
                name=p.get('name', '').strip(),
                unit=p.get('unit', '').strip(),
                value=str(p.get('value', '')).strip(),
                min=str(p.get('min', '')).strip(),
                max=str(p.get('max', '')).strip(),
                status=p.get('status', 'Normal').strip()
            )

        return JsonResponse({'success': True, 'message': 'Report updated successfully'})
    except CitizenReport.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Report not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def citizen_report_delete(request, report_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'}, status=405)
    try:
        from .models import CitizenReport
        report = CitizenReport.objects.get(id=report_id, user_id=user_id)
        report.delete()
        return JsonResponse({'success': True, 'message': 'Report deleted successfully'})
    except CitizenReport.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Report not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def citizen_appointments_list(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    
    query = request.GET.get('search', '').strip().lower()
    try:
        from .models import Appointment
        appointments = Appointment.objects.filter(citizen_id=user_id).order_by('appointment_date', 'appointment_time')
        
        appt_list = []
        for a in appointments:
            date_str = a.appointment_date.strftime('%Y-%m-%d')
            time_str = a.appointment_time.strftime('%H:%M')
            specialty = a.doctor.specialization or 'General Medicine'
            
            if query:
                if (query not in a.doctor.name.lower() and 
                    query not in a.reason.lower() and 
                    query not in specialty.lower() and 
                    query not in str(a.id)):
                    continue
            
            appt_list.append({
                'id': a.id,
                'doctor_id': a.doctor.id,
                'doctor_name': a.doctor.name,
                'specialty': specialty,
                'reason': a.reason,
                'appointment_date': date_str,
                'appointment_time': time_str,
                'status': a.status,
                'created_at': a.created_at.strftime('%Y-%m-%d %H:%M:%S') if a.created_at else ''
            })
        return JsonResponse({'success': True, 'appointments': appt_list})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def citizen_appointment_add(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'}, status=405)
    
    try:
        import json
        from .models import Appointment
        from accounts.models import UserProfile
        
        data = json.loads(request.body)
        doctor_id = data.get('doctor_id')
        reason = data.get('reason', '').strip()
        date_str = data.get('appointment_date')
        time_str = data.get('appointment_time')
        
        if not doctor_id or not date_str or not time_str or not reason:
            return JsonResponse({'success': False, 'error': 'All fields are required'}, status=400)
            
        try:
            doctor = UserProfile.objects.get(id=doctor_id, user_type='doctor')
        except UserProfile.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Doctor not found'}, status=404)
            
        # Check if the citizen already has another active appointment at the exact same date and time
        conflict_exists = Appointment.objects.filter(
            citizen_id=user_id,
            appointment_date=date_str,
            appointment_time=time_str
        ).exclude(status='Cancelled').exists()
        
        if conflict_exists:
            return JsonResponse({
                'success': False, 
                'error': f'You have already booked another doctor appointment at this same time ({time_str}) on {date_str}.'
            }, status=400)

        appointment = Appointment.objects.create(
            citizen_id=user_id,
            doctor=doctor,
            reason=reason,
            appointment_date=date_str,
            appointment_time=time_str
        )
        return JsonResponse({'success': True, 'message': 'Appointment booked successfully', 'id': appointment.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def citizen_appointment_edit(request, appointment_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'}, status=405)
        
    try:
        import json
        from .models import Appointment
        from accounts.models import UserProfile
        
        data = json.loads(request.body)
        doctor_id = data.get('doctor_id')
        reason = data.get('reason', '').strip()
        date_str = data.get('appointment_date')
        time_str = data.get('appointment_time')
        
        if not doctor_id or not date_str or not time_str or not reason:
            return JsonResponse({'success': False, 'error': 'All fields are required'}, status=400)
            
        try:
            appointment = Appointment.objects.get(id=appointment_id, citizen_id=user_id)
            if appointment.status == 'Completed':
                return JsonResponse({'success': False, 'error': 'Cannot edit a completed appointment'}, status=400)
        except Appointment.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Appointment not found'}, status=404)
            
        try:
            doctor = UserProfile.objects.get(id=doctor_id, user_type='doctor')
        except UserProfile.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Doctor not found'}, status=404)
            
        # Check if the citizen already has another active appointment at the exact same date and time (excluding this one)
        conflict_exists = Appointment.objects.filter(
            citizen_id=user_id,
            appointment_date=date_str,
            appointment_time=time_str
        ).exclude(id=appointment_id).exclude(status='Cancelled').exists()
        
        if conflict_exists:
            return JsonResponse({
                'success': False, 
                'error': f'You have already booked another doctor appointment at this same time ({time_str}) on {date_str}.'
            }, status=400)

        appointment.doctor = doctor
        appointment.reason = reason
        appointment.appointment_date = date_str
        appointment.appointment_time = time_str
        appointment.save()
        
        return JsonResponse({'success': True, 'message': 'Appointment updated successfully'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def citizen_appointment_delete(request, appointment_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'}, status=405)
        
    try:
        from .models import Appointment
        appointment = Appointment.objects.get(id=appointment_id, citizen_id=user_id)
        if appointment.status == 'Completed':
            return JsonResponse({'success': False, 'error': 'Cannot delete a completed appointment'}, status=400)
        appointment.delete()
        return JsonResponse({'success': True, 'message': 'Appointment cancelled successfully'})
    except Appointment.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Appointment not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def get_approved_doctors(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        from accounts.models import UserProfile
        citizen = UserProfile.objects.get(id=user_id)
        doctors = UserProfile.objects.filter(
            user_type='doctor', 
            is_approved=True, 
            pincode=citizen.pincode
        ).order_by('name')
        
        import time
        doc_list = []
        for d in doctors:
            slot = d.appointment_slot
            slot_time_str = d.appointment_slot_time
            if slot and slot_time_str:
                try:
                    slot_time = int(slot_time_str)
                    twenty_four_hours_ms = 24 * 60 * 60 * 1000
                    current_time_ms = int(time.time() * 1000)
                    if current_time_ms - slot_time >= twenty_four_hours_ms:
                        d.appointment_slot = None
                        d.appointment_slot_time = None
                        d.save()
                        slot = None
                except ValueError:
                    pass
            
            doc_list.append({
                'id': d.id,
                'name': d.name,
                'gender': d.gender or 'Not Specified',
                'specialty': d.specialization or 'General Medicine',
                'address': d.address or '',
                'city': d.city or '',
                'state': d.state or '',
                'pincode': d.pincode or '',
                'mobile_number': d.mobile_number or '',
                'appointment_slot': slot or ''
            })
        return JsonResponse({'success': True, 'doctors': doc_list, 'citizen_pincode': citizen.pincode})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)



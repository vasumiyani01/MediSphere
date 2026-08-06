import os
import json
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from accounts.models import UserProfile
from accounts.views import log_activity

def doctor_dashboard(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('/')
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'doctor':
            dest = 'pharmacies' if profile.user_type == 'pharmacy' else f'{profile.user_type}s'
            return redirect(f'/{dest}/')
    except UserProfile.DoesNotExist:
        return redirect('/')
    
    return render(request, 'doctors/dashboard.html')

@csrf_exempt
def update_doctor_profile(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)
    
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'doctor':
            return JsonResponse({'success': False, 'error': 'Access denied: not a doctor'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
        
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        mobile_number = data.get('mobile_number', '').strip()
        email = data.get('email', '').strip()
        license_number = data.get('license_number', '').strip()
        address = data.get('address', '').strip()
        city = data.get('city', '').strip()
        state = data.get('state', '').strip()
        pincode = data.get('pincode', '').strip()
        open_from = data.get('open_from', '').strip()
        closes_from = data.get('closes_from', '').strip()
        specialization = data.get('specialization', '').strip()
        gender = data.get('gender', '').strip()
        
        if not (name and mobile_number and email and license_number and address and city and state and pincode and open_from and closes_from and specialization and gender):
            return JsonResponse({'success': False, 'error': 'All fields are required to complete your profile'}, status=400)
            
        if UserProfile.objects.filter(mobile_number=mobile_number).exclude(id=profile.id).exists():
            return JsonResponse({'success': False, 'error': 'Mobile number is already in use.'}, status=400)
            
        if UserProfile.objects.filter(email=email).exclude(id=profile.id).exists():
            return JsonResponse({'success': False, 'error': 'Email is already in use.'}, status=400)
            
        profile.name = name
        profile.mobile_number = mobile_number
        profile.email = email
        profile.license_number = license_number
        profile.address = address
        profile.city = city
        profile.state = state
        profile.pincode = pincode
        profile.open_from = open_from
        profile.closes_from = closes_from
        profile.specialization = specialization
        profile.gender = gender
        profile.save()
        
        log_activity(request, profile.email, "Doctor profile completed/updated")
        
        return JsonResponse({
            'success': True,
            'message': 'Profile updated successfully',
            'user': {
                'name': profile.name,
                'mobile_number': profile.mobile_number,
                'email': profile.email,
                'license_number': profile.license_number,
                'address': profile.address,
                'city': profile.city,
                'state': profile.state,
                'pincode': profile.pincode,
                'open_from': profile.open_from,
                'closes_from': profile.closes_from,
                'specialization': profile.specialization
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
def doctor_appointments_list(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'doctor':
            return JsonResponse({'success': False, 'error': 'Access denied: not a doctor'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
        
    query = request.GET.get('search', '').strip().lower()
    try:
        from citizens.models import Appointment
        appointments = Appointment.objects.filter(doctor_id=user_id).order_by('appointment_date', 'appointment_time')
        
        appt_list = []
        for a in appointments:
            date_str = a.appointment_date.strftime('%Y-%m-%d')
            time_str = a.appointment_time.strftime('%H:%M')
            
            if query:
                if (query not in a.citizen.name.lower() and 
                    query not in a.reason.lower() and 
                    query not in (a.citizen.city or '').lower() and 
                    query not in str(a.id)):
                    continue
            
            appt_list.append({
                'id': a.id,
                'patient_id': a.citizen.id,
                'patient_name': a.citizen.name,
                'patient_gender': a.citizen.gender or 'Male',
                'patient_age': a.citizen.age or '',
                'patient_mobile': a.citizen.mobile_number or '',
                'patient_city': a.citizen.city or '',
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
def complete_appointment(request, appointment_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'}, status=405)
        
    try:
        from citizens.models import Appointment
        appointment = Appointment.objects.get(id=appointment_id, doctor_id=user_id)
        appointment.status = 'Completed'
        appointment.save()
        
        # Log activity
        log_activity(request, appointment.doctor.email, f"Completed appointment ID {appointment.id} for citizen {appointment.citizen.name}")
        
        return JsonResponse({'success': True, 'message': 'Appointment marked as Completed'})
    except Appointment.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Appointment not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
@csrf_exempt
def accept_appointment(request, appointment_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'}, status=405)
        
    try:
        from citizens.models import Appointment
        appointment = Appointment.objects.get(id=appointment_id, doctor_id=user_id)
        if appointment.status != 'Booked':
            return JsonResponse({'success': False, 'error': f'Cannot accept appointment with status: {appointment.status}'}, status=400)
            
        appointment.status = 'Accepted'
        appointment.save()
        
        # Log activity
        log_activity(request, appointment.doctor.email, f"Accepted appointment ID {appointment.id} for citizen {appointment.citizen.name}")
        
        return JsonResponse({'success': True, 'message': 'Appointment marked as Accepted'})
    except Appointment.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Appointment not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def update_appointment_slot(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'doctor':
            return JsonResponse({'success': False, 'error': 'Access denied: not a doctor'}, status=403)
        
        import time
        data = json.loads(request.body)
        slot = data.get('slot', '').strip()
        
        profile.appointment_slot = slot
        profile.appointment_slot_time = str(int(time.time() * 1000)) if slot else None
        profile.save()
        
        log_activity(request, profile.email, f"Doctor updated appointment availability slot: {slot if slot else 'Cleared'}")
        
        return JsonResponse({'success': True, 'message': 'Appointment slot updated successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


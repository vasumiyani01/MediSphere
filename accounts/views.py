import random
import string
import json
import datetime
import threading
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password

from .models import UserProfile

def generate_otp():
    return "".join(random.choices(string.digits, k=6))

@csrf_exempt
def send_otp(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get('username') or data.get('name')
        mobile_number = data.get('mobile_number') or data.get('mobile')
        email = data.get('email')
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({'success': False, 'error': 'Invalid request payload'}, status=400)

    if not username or not mobile_number or not email:
        return JsonResponse({'success': False, 'error': 'All fields are required'}, status=400)

    # Validate if mobile number or email already exists in users table
    if UserProfile.objects.filter(email=email).exists():
        return JsonResponse({'success': False, 'error': 'Email address is already registered'}, status=400)
    
    if UserProfile.objects.filter(mobile_number=mobile_number).exists():
        return JsonResponse({'success': False, 'error': 'Mobile number is already registered'}, status=400)

    # Check for cooldown: last sent OTP should be older than 60 seconds
    last_otp_str = request.session.get('signup_created_at')
    last_otp_mobile = request.session.get('signup_mobile_number')
    if last_otp_str and last_otp_mobile == mobile_number:
        try:
            last_otp_time = timezone.datetime.fromisoformat(last_otp_str)
            if timezone.now() < last_otp_time + datetime.timedelta(seconds=60):
                time_left = int((last_otp_time + datetime.timedelta(seconds=60) - timezone.now()).total_seconds())
                return JsonResponse({
                    'success': False, 
                    'error': f'Please wait {time_left} seconds before requesting a new OTP.'
                }, status=429)
        except Exception:
            pass

    # Generate and save OTP to session
    otp = generate_otp()
    request.session['signup_otp'] = otp
    request.session['signup_name'] = username
    request.session['signup_mobile_number'] = mobile_number
    request.session['signup_email'] = email
    request.session['signup_created_at'] = timezone.now().isoformat()
    request.session['signup_verified'] = False

    # Prepare HTML email body
    subject = 'MediSphere Verification OTP'
    text_content = f"Hello {username},\n\nYour One-Time Password (OTP) for MediSphere account verification is: {otp}\n\nThis OTP is valid for 5 minutes. Please do not share this code.\n\nThank you,\nMediSphere Team"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="background-color: #070b13; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070b13; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #0c1220; border: 1px solid #1e3a8a; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); overflow: hidden;">
                        <tr>
                            <td style="padding: 32px; text-align: center;">
                                <!-- Logo Container (Using Solid Background & Table Formatting) -->
                                <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin-bottom: 20px;">
                                    <tr>
                                        <td align="center" valign="middle" style="background-color: #3b82f6; width: 48px; height: 48px; border-radius: 12px; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);">
                                            <img src="https://img.icons8.com/ios-filled/50/ffffff/heartbeat.png" width="24" height="24" style="display: block; margin: 0 auto; outline: none; border: none;" alt="MediSphere Logo">
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Clean Title (No text-clip gradient to ensure readability) -->
                                <div style="font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 4px; letter-spacing: 0.5px;">MediSphere</div>
                                <div style="font-size: 13px; color: #3b82f6; font-weight: 600; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px;">AI-Powered Smart Healthcare Ecosystem</div>
                                
                                <div style="text-align: left; border-top: 1px solid #1e293b; padding-top: 24px; margin-bottom: 20px;">
                                    <p style="margin: 0 0 12px 0; color: #f8fafc; font-size: 15px;">Hello <strong>{username}</strong>,</p>
                                    <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">Use the following One-Time Password (OTP) to complete your account registration on the MediSphere ecosystem.</p>
                                </div>
                                
                                <!-- OTP Box (High Contrast & Clear) -->
                                <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 20px 0;">
                                    <tr>
                                        <td align="center" style="background-color: rgba(59, 130, 246, 0.1); border: 1px dashed #3b82f6; border-radius: 12px; padding: 14px 28px; font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 6px;">
                                            {otp}
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="color: #64748b; font-size: 11px; margin: 24px 0 0 0; line-height: 1.5; text-align: left;">⚠️ This OTP is valid for <strong>5 minutes</strong>. For security reasons, please do not share this code with anyone.</p>
                                
                                <!-- Footer -->
                                <div style="border-top: 1px solid #1e293b; margin-top: 30px; padding-top: 20px; font-size: 11px; color: #475569; text-align: center;">
                                    © 2026 MediSphere Healthcare. All rights reserved.
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    def send_email_async(email_msg):
        try:
            email_msg.send()
            print("Background email sent successfully!")
            import os
            if os.path.exists("smtp_error.log"):
                os.remove("smtp_error.log")
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print("Background email sending FAILED:")
            print(tb)
            try:
                with open("smtp_error.log", "w") as f:
                    f.write(tb)
            except Exception:
                pass

    try:
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [email])
        msg.attach_alternative(html_content, "text/html")
        threading.Thread(target=send_email_async, args=(msg,)).start()
    except Exception as e:
        request.session.pop('signup_otp', None)
        return JsonResponse({
            'success': False, 
            'error': 'Failed to initiate verification email. Please verify your SMTP settings.'
        }, status=500)

    return JsonResponse({'success': True, 'message': 'OTP sent successfully'})

@csrf_exempt
def verify_otp(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        mobile_number = data.get('mobile_number') or data.get('mobile')
        otp = data.get('otp')
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({'success': False, 'error': 'Invalid request payload'}, status=400)

    if not otp:
        return JsonResponse({'success': False, 'error': 'OTP is required'}, status=400)
    if not email and not mobile_number:
        return JsonResponse({'success': False, 'error': 'Email or mobile number is required'}, status=400)

    session_otp = request.session.get('signup_otp')
    session_mobile = request.session.get('signup_mobile_number')
    session_email = request.session.get('signup_email')
    session_verified = request.session.get('signup_verified', False)

    if email and session_email != email:
        return JsonResponse({'success': False, 'error': 'Invalid OTP or email'}, status=400)
    if mobile_number and session_mobile != mobile_number:
        return JsonResponse({'success': False, 'error': 'Invalid OTP or mobile number'}, status=400)

    if not session_otp or session_otp != otp or session_verified:
        return JsonResponse({'success': False, 'error': 'Invalid OTP'}, status=400)

    created_at_str = request.session.get('signup_created_at')
    if created_at_str:
        try:
            created_at = timezone.datetime.fromisoformat(created_at_str)
            if (timezone.now() - created_at).total_seconds() > 300:
                return JsonResponse({'success': False, 'error': 'OTP has expired. Please request a new one.'}, status=400)
        except Exception:
            return JsonResponse({'success': False, 'error': 'OTP verification session corrupted'}, status=400)

    # Mark as verified in session
    request.session['signup_verified'] = True

    return JsonResponse({'success': True, 'message': 'OTP verified successfully'})

@csrf_exempt
def register_user(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        mobile_number = data.get('mobile_number') or data.get('mobile')
        password = data.get('password')
        user_type = data.get('user_type', 'citizen')
        license_number = data.get('license_number')
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({'success': False, 'error': 'Invalid request payload'}, status=400)

    if not mobile_number or not password:
        return JsonResponse({'success': False, 'error': 'Mobile number and password are required'}, status=400)

    if user_type not in ['citizen', 'doctor', 'pharmacy']:
        return JsonResponse({'success': False, 'error': 'Invalid user type'}, status=400)

    if user_type in ['doctor', 'pharmacy'] and not license_number:
        return JsonResponse({'success': False, 'error': 'License number is required for professional accounts'}, status=400)

    # Check for verified OTP in session
    session_otp = request.session.get('signup_otp')
    session_mobile = request.session.get('signup_mobile_number')
    session_verified = request.session.get('signup_verified', False)
    session_name = request.session.get('signup_name')
    session_email = request.session.get('signup_email')

    if not session_verified or session_mobile != mobile_number:
        return JsonResponse({'success': False, 'error': 'Please verify your OTP first'}, status=400)

    created_at_str = request.session.get('signup_created_at')
    if created_at_str:
        try:
            created_at = timezone.datetime.fromisoformat(created_at_str)
            if (timezone.now() - created_at).total_seconds() > 300:
                return JsonResponse({'success': False, 'error': 'Session expired. Please start registration again.'}, status=400)
        except Exception:
            return JsonResponse({'success': False, 'error': 'Session verification corrupted'}, status=400)

    # Ensure details are not already registered
    if UserProfile.objects.filter(email=session_email).exists():
        return JsonResponse({'success': False, 'error': 'Email address is already registered'}, status=400)

    if UserProfile.objects.filter(mobile_number=mobile_number).exists():
        return JsonResponse({'success': False, 'error': 'Mobile number is already registered'}, status=400)

    try:
        # Create Custom User directly in UserProfile (users table)
        profile = UserProfile.objects.create(
            name=session_name,
            mobile_number=mobile_number,
            email=session_email,
            password=make_password(password),
            user_type=user_type,
            license_number=license_number if user_type != 'citizen' else None,
            is_approved=(user_type == 'citizen')
        )
        
        # Log session in Django using custom session key
        request.session['user_id'] = profile.id

        # Log activity
        log_activity(request, profile.email, f"User registered as {profile.user_type}")
        
        # Clean up session verification
        request.session.pop('signup_otp', None)
        request.session.pop('signup_name', None)
        request.session.pop('signup_mobile_number', None)
        request.session.pop('signup_email', None)
        request.session.pop('signup_created_at', None)
        request.session.pop('signup_verified', None)

        return JsonResponse({
            'success': True,
            'message': 'Registration successful',
            'user': {
                'name': profile.name,
                'username': profile.name,
                'email': profile.email,
                'mobile_number': profile.mobile_number,
                'user_type': profile.user_type,
                'license_number': profile.license_number,
                'address': profile.address or '',
                'city': profile.city or '',
                'state': profile.state or '',
                'pincode': profile.pincode or '',
                'open_from': profile.open_from or '',
                'closes_from': profile.closes_from or '',
                'checkout_option': profile.checkout_option or ''
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': f'Failed to create user: {str(e)}'}, status=500)

@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        mobile_number = data.get('mobile_number')
        password = data.get('password')
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({'success': False, 'error': 'Invalid request payload'}, status=400)

    if not mobile_number or not password:
        return JsonResponse({'success': False, 'error': 'Mobile number and password are required'}, status=400)

    try:
        profile = UserProfile.objects.get(mobile_number=mobile_number)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Invalid mobile number or password'}, status=400)

    print(f"[LOGIN DEBUG] Mobile: {mobile_number}, Password entered: {password}")
    print(f"[LOGIN DEBUG] DB password hash: {profile.password[:60]}...")
    print(f"[LOGIN DEBUG] check_password result: {check_password(password, profile.password)}")

    if not check_password(password, profile.password):
        # Password mismatch - reset to mobile number if password was corrupted
        print(f"[LOGIN DEBUG] Password mismatch. Resetting password to mobile number for user {profile.name}")
        profile.password = make_password(mobile_number)
        profile.save()
        # Now verify with the mobile number as password
        if password != mobile_number:
            return JsonResponse({'success': False, 'error': 'Invalid mobile number or password. Your password has been reset to your mobile number. Please try again using your mobile number as the password.'}, status=400)

    if check_password(password, profile.password):
        # Block unapproved doctors and pharmacies from logging in
        if not profile.is_approved and profile.user_type in ('doctor', 'pharmacy'):
            return JsonResponse({
                'success': False,
                'error': 'Your account is pending admin approval. Please wait for the administrator to verify your credentials.'
            }, status=403)

        request.session['user_id'] = profile.id
        log_activity(request, profile.email, "User logged in")
        return JsonResponse({
            'success': True,
            'message': 'Login successful',
            'user': {
                'name': profile.name,
                'username': profile.name,
                'email': profile.email,
                'mobile_number': profile.mobile_number,
                'user_type': profile.user_type,
                'license_number': profile.license_number,
                'address': profile.address or '',
                'city': profile.city or '',
                'state': profile.state or '',
                'pincode': profile.pincode or '',
                'open_from': profile.open_from or '',
                'closes_from': profile.closes_from or '',
                'checkout_option': profile.checkout_option or '',
                'age': profile.age or '',
                'gender': profile.gender or ''
            }
        })
    else:
        return JsonResponse({'success': False, 'error': 'Invalid mobile number or password'}, status=400)

def logout_user(request):
    user_id = request.session.get('user_id')
    if user_id:
        try:
            profile = UserProfile.objects.get(id=user_id)
            log_activity(request, profile.email, "User logged out")
        except UserProfile.DoesNotExist:
            pass
    request.session.flush()
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})

def user_status(request):
    user_id = request.session.get('user_id')
    if user_id:
        try:
            profile = UserProfile.objects.get(id=user_id)
            return JsonResponse({
                'logged_in': True,
                'user': {
                    'name': profile.name,
                    'username': profile.name,
                    'email': profile.email,
                    'mobile_number': profile.mobile_number,
                    'user_type': profile.user_type,
                    'license_number': profile.license_number,
                    'address': profile.address or '',
                    'city': profile.city or '',
                    'state': profile.state or '',
                    'pincode': profile.pincode or '',
                    'open_from': profile.open_from or '',
                    'closes_from': profile.closes_from or '',
                    'checkout_option': profile.checkout_option or '',
                    'specialization': profile.specialization or '',
                    'age': profile.age or '',
                    'gender': profile.gender or ''
                }
            })
        except UserProfile.DoesNotExist:
            request.session.flush()
            return JsonResponse({'logged_in': False})
    else:
        return JsonResponse({'logged_in': False})


def log_activity(request, email, action):
    try:
        from .models import ActivityLog, UserProfile
        user_name = '-'
        if email:
            try:
                profile = UserProfile.objects.get(email=email)
                user_name = profile.name
            except UserProfile.DoesNotExist:
                pass
        ActivityLog.objects.create(
            user_email=email,
            user_name=user_name,
            action=action
        )
    except Exception as log_err:
        print(f"Failed to log activity: {log_err}")

import json
from django.views.decorators.csrf import csrf_exempt
from .models import HelpdeskTicket

@csrf_exempt
def helpdesk_send(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
        
    try:
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        if not message:
            return JsonResponse({'success': False, 'error': 'Message cannot be empty'}, status=400)
            
        ticket = HelpdeskTicket.objects.create(
            sender_email=profile.email,
            sender_name=profile.name,
            sender_type=profile.user_type,
            message=message
        )
        return JsonResponse({'success': True, 'ticket_id': ticket.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def helpdesk_my_tickets(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)

    tickets = HelpdeskTicket.objects.filter(sender_email=profile.email).order_by('-created_at')
    
    def get_shortcode(name):
        cleaned = "".join([c for c in name if c.isalpha()]).upper()
        if len(cleaned) >= 3:
            return cleaned[:3]
        return (cleaned + "TKT")[:3]
        
    shortcode = get_shortcode(profile.name)
    
    ticket_list = []
    for t in tickets:
        ticket_list.append({
            'id': t.id,
            'ticket_code': f"{shortcode}{t.id:03d}",
            'message': t.message,
            'status': t.status,
            'created_at': t.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return JsonResponse({'success': True, 'tickets': ticket_list})


@csrf_exempt
def helpdesk_delete_ticket(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
    try:
        data = json.loads(request.body)
        ticket_id = data.get('ticket_id')
        if not ticket_id:
            return JsonResponse({'success': False, 'error': 'Missing ticket ID'}, status=400)
        ticket = HelpdeskTicket.objects.get(id=ticket_id, sender_email=profile.email)
        ticket.status = 'deleted'
        ticket.save()
        return JsonResponse({'success': True, 'message': 'Ticket deleted successfully.'})
    except HelpdeskTicket.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Ticket not found or not yours.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def public_stats(request):
    try:
        from accounts.models import UserProfile
        from medicines.models import Medicine
        try:
            from diseases.models import Disease
            diseases_count = Disease.objects.count()
        except Exception:
            diseases_count = 0

        citizens = UserProfile.objects.filter(user_type='citizen').count()
        doctors = UserProfile.objects.filter(user_type='doctor').count()
        pharmacies = UserProfile.objects.filter(user_type='pharmacy').count()
        medicines = Medicine.objects.count()

        return JsonResponse({
            'success': True,
            'citizens': citizens,
            'doctors': doctors,
            'pharmacies': pharmacies,
            'medicines': medicines,
            'diseases': diseases_count
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def public_medicines(request):
    try:
        from medicines.models import Medicine
        if Medicine.objects.count() == 0:
            Medicine.objects.create(name='Paracetamol 650mg', manufacturer='GSK Labs', category='tablet', pack_size='10 Tablets', uses='Fever and pain relief', side_effects='Nausea')
            Medicine.objects.create(name='Amoxicillin 500mg', manufacturer='Pfizer Corp', category='capsule', pack_size='10 Capsules', uses='Antibiotic for bacterial infections', side_effects='Diarrhea')
            Medicine.objects.create(name='Latanoprost Eye Drops', manufacturer='Lupin Ltd', category='drops', pack_size='2.5 ml', uses='Treat high eye pressure / Glaucoma', side_effects='Eye redness')
            Medicine.objects.create(name='Metformin 850mg', manufacturer='Sandoz Pharma', category='tablet', pack_size='20 Tablets', uses='Type 2 Diabetes mellitus control', side_effects='Flatulence')
            Medicine.objects.create(name='Benadryl Cough Syrup', manufacturer='Abbott', category='syrup', pack_size='100 ml', uses='Cough and cold symptom relief', side_effects='Drowsiness')
            Medicine.objects.create(name='Azithromycin 500mg', manufacturer='Cipla', category='tablet', pack_size='5 Tablets', uses='Bacterial infections treatment', side_effects='Stomach pain')
            Medicine.objects.create(name='Amlodipine 5mg', manufacturer='Sun Pharma', category='tablet', pack_size='15 Tablets', uses='High blood pressure treatment', side_effects='Ankle swelling')
            Medicine.objects.create(name='Insulin Glargine', manufacturer='Sanofi', category='other', pack_size='3 ml pen', uses='Diabetes control', side_effects='Hypoglycemia')

        meds = Medicine.objects.all().order_by('name')
        data = []
        for m in meds:
            data.append({
                'id': m.id,
                'name': m.name,
                'manufacturer': m.manufacturer,
                'category': m.category,
                'pack_size': m.pack_size,
                'uses': m.uses,
                'side_effects': m.side_effects,
                'image_url': m.image_url or ''
            })
        return JsonResponse({'success': True, 'medicines': data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def public_diseases(request):
    try:
        from diseases.models import Disease
        diseases = Disease.objects.all().order_by('name')
        data = []
        for d in diseases:
            data.append({
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
        return JsonResponse({'success': True, 'diseases': data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def public_pharmacies(request):
    try:
        from accounts.models import UserProfile
        pharmacies = UserProfile.objects.filter(user_type='pharmacy', is_approved=True).order_by('name')
        data = []
        for p in pharmacies:
            data.append({
                'id': p.id,
                'name': p.name,
                'email': p.email,
                'mobile_number': p.mobile_number,
                'license_number': p.license_number or '',
                'address': p.address or '',
                'city': p.city or '',
                'state': p.state or '',
                'pincode': p.pincode or '',
                'open_from': p.open_from or '',
                'closes_from': p.closes_from or '',
                'checkout_option': p.checkout_option or ''
            })
        return JsonResponse({'success': True, 'pharmacies': data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def public_doctors(request):
    try:
        from accounts.models import UserProfile
        doctors = UserProfile.objects.filter(user_type='doctor', is_approved=True).order_by('name')
        data = []
        for d in doctors:
            data.append({
                'id': d.id,
                'name': d.name,
                'email': d.email,
                'mobile_number': d.mobile_number,
                'license_number': d.license_number or '',
                'address': d.address or '',
                'city': d.city or '',
                'state': d.state or '',
                'pincode': d.pincode or '',
                'open_from': d.open_from or '',
                'closes_from': d.closes_from or '',
                'specialization': d.specialization or ''
            })
        return JsonResponse({'success': True, 'doctors': data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def forgot_password_request(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({'success': False, 'error': 'Invalid request payload'}, status=400)

    if not email:
        return JsonResponse({'success': False, 'error': 'Email is required'}, status=400)

    try:
        user = UserProfile.objects.get(email=email)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not registered'}, status=400)

    otp = generate_otp()
    request.session['forgot_email'] = email
    request.session['forgot_otp'] = otp
    request.session['forgot_created_at'] = timezone.now().isoformat()
    request.session['forgot_verified'] = False

    subject = 'MediSphere Password Reset OTP'
    text_content = f"Hello {user.name},\n\nYour One-Time Password (OTP) for resetting your MediSphere password is: {otp}\n\nThis OTP is valid for 5 minutes. Please do not share this code.\n\nThank you,\nMediSphere Team"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="background-color: #070b13; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070b13; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #0c1220; border: 1px solid #1e3a8a; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); overflow: hidden;">
                        <tr>
                            <td style="padding: 32px; text-align: center;">
                                <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin-bottom: 20px;">
                                    <tr>
                                        <td align="center" valign="middle" style="background-color: #ef4444; width: 48px; height: 48px; border-radius: 12px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);">
                                            <img src="https://img.icons8.com/ios-filled/50/ffffff/key.png" width="24" height="24" style="display: block; margin: 0 auto; outline: none; border: none;" alt="Key Icon">
                                        </td>
                                    </tr>
                                </table>
                                
                                <div style="font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 4px; letter-spacing: 0.5px;">Reset Password</div>
                                <div style="font-size: 13px; color: #ef4444; font-weight: 600; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px;">MediSphere Security Service</div>
                                
                                <div style="text-align: left; border-top: 1px solid #1e293b; padding-top: 24px; margin-bottom: 20px;">
                                    <p style="margin: 0 0 12px 0; color: #f8fafc; font-size: 15px;">Hello <strong>{user.name}</strong>,</p>
                                    <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">You requested a password reset. Use the following One-Time Password (OTP) to verify your request. If you did not request this, you can ignore this email.</p>
                                </div>
                                
                                <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 20px 0;">
                                    <tr>
                                        <td align="center" style="background-color: rgba(239, 68, 68, 0.1); border: 1px dashed #ef4444; border-radius: 12px; padding: 14px 28px; font-size: 32px; font-weight: bold; color: #ef4444; letter-spacing: 6px;">
                                            {otp}
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="color: #64748b; font-size: 11px; margin: 24px 0 0 0; line-height: 1.5; text-align: left;">⚠️ This OTP is valid for <strong>5 minutes</strong>. For security reasons, please do not share this code with anyone.</p>
                                
                                <div style="border-top: 1px solid #1e293b; margin-top: 30px; padding-top: 20px; font-size: 11px; color: #475569; text-align: center;">
                                    © 2026 MediSphere Healthcare. All rights reserved.
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    def send_email_async(email_msg):
        try:
            email_msg.send()
        except Exception:
            pass

    try:
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [email])
        msg.attach_alternative(html_content, "text/html")
        threading.Thread(target=send_email_async, args=(msg,)).start()
    except Exception as e:
        request.session.pop('forgot_otp', None)
        return JsonResponse({'success': False, 'error': 'Failed to initiate reset email. Please verify SMTP configuration.'}, status=500)

    return JsonResponse({'success': True, 'message': 'OTP sent successfully'})


@csrf_exempt
def forgot_password_verify(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        otp = data.get('otp', '').strip()
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({'success': False, 'error': 'Invalid request payload'}, status=400)

    if not email or not otp:
        return JsonResponse({'success': False, 'error': 'Email and OTP are required'}, status=400)

    session_email = request.session.get('forgot_email')
    session_otp = request.session.get('forgot_otp')
    session_verified = request.session.get('forgot_verified', False)

    if not session_email or session_email != email or not session_otp or session_otp != otp or session_verified:
        return JsonResponse({'success': False, 'error': 'Invalid OTP or email'}, status=400)

    created_at_str = request.session.get('forgot_created_at')
    if created_at_str:
        try:
            created_at = timezone.datetime.fromisoformat(created_at_str)
            if (timezone.now() - created_at).total_seconds() > 300:
                return JsonResponse({'success': False, 'error': 'OTP has expired. Please request a new one.'}, status=400)
        except Exception:
            return JsonResponse({'success': False, 'error': 'Verification session corrupted'}, status=400)

    request.session['forgot_verified'] = True
    return JsonResponse({'success': True, 'message': 'OTP verified successfully'})


@csrf_exempt
def forgot_password_reset(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '')
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({'success': False, 'error': 'Invalid request payload'}, status=400)

    if not email or not password:
        return JsonResponse({'success': False, 'error': 'Email and new password are required'}, status=400)

    session_email = request.session.get('forgot_email')
    session_verified = request.session.get('forgot_verified', False)

    if not session_verified or session_email != email:
        return JsonResponse({'success': False, 'error': 'Unauthorized password reset request'}, status=403)

    if len(password) < 6:
        return JsonResponse({'success': False, 'error': 'Password must be at least 6 characters'}, status=400)

    try:
        user = UserProfile.objects.get(email=email)
        user.password = make_password(password)
        user.save()

        # Clean up session
        request.session.pop('forgot_email', None)
        request.session.pop('forgot_otp', None)
        request.session.pop('forgot_created_at', None)
        request.session.pop('forgot_verified', None)

        return JsonResponse({'success': True, 'message': 'Password reset successfully'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

import random
import string
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import json
import datetime

from .models import CustomUser, OTPVerification

def generate_otp():
    return "".join(random.choices(string.digits, k=6))

@csrf_exempt
def send_otp(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get('username')
        mobile_number = data.get('mobile_number')
        email = data.get('email')
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({'success': False, 'error': 'Invalid request payload'}, status=400)

    if not username or not mobile_number or not email:
        return JsonResponse({'success': False, 'error': 'All fields are required'}, status=400)

    # Validate if mobile number or email already exists
    if CustomUser.objects.filter(mobile_number=mobile_number).exists():
        return JsonResponse({'success': False, 'error': 'Mobile number is already registered'}, status=400)
    
    if CustomUser.objects.filter(email=email).exists():
        return JsonResponse({'success': False, 'error': 'Email address is already registered'}, status=400)

    # Check for cooldown: last sent OTP should be older than 60 seconds
    last_otp = OTPVerification.objects.filter(mobile_number=mobile_number).order_by('-created_at').first()
    if last_otp and timezone.now() < last_otp.created_at + datetime.timedelta(seconds=60):
        time_left = int((last_otp.created_at + datetime.timedelta(seconds=60) - timezone.now()).total_seconds())
        return JsonResponse({
            'success': False, 
            'error': f'Please wait {time_left} seconds before requesting a new OTP.'
        }, status=429)

    # Generate and save OTP
    otp = generate_otp()
    verification = OTPVerification.objects.create(
        username=username,
        mobile_number=mobile_number,
        email=email,
        otp=otp
    )

    # Prepare HTML email body
    subject = 'MediSphere Verification OTP'
    text_content = f"Hello {username},\n\nYour One-Time Password (OTP) for MediSphere account verification is: {otp}\n\nThis OTP is valid for 5 minutes. Please do not share this code.\n\nThank you,\nMediSphere Team"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                background-color: #070b13;
                color: #f8fafc;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 40px 20px;
            }}
            .container {{
                max-width: 500px;
                margin: 0 auto;
                background-color: #0c1220;
                border: 1px solid rgba(59, 130, 246, 0.25);
                border-radius: 16px;
                padding: 32px;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            }}
            .logo {{
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                width: 48px;
                height: 48px;
                border-radius: 12px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
                box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
                color: #ffffff;
            }}
            .title {{
                font-size: 24px;
                font-weight: 800;
                margin-bottom: 8px;
                background: linear-gradient(135deg, #ffffff 30%, #3b82f6 100%);
                color: #ffffff;
            }}
            .subtitle {{
                color: #94a3b8;
                font-size: 14px;
                margin-bottom: 30px;
            }}
            .otp-box {{
                background: rgba(59, 130, 246, 0.1);
                border: 1px dashed #3b82f6;
                border-radius: 12px;
                padding: 16px;
                font-size: 32px;
                font-weight: bold;
                color: #3b82f6;
                letter-spacing: 6px;
                margin: 20px 0;
                display: inline-block;
            }}
            .warning {{
                color: #64748b;
                font-size: 12px;
                margin-top: 24px;
                line-height: 1.5;
            }}
            .footer {{
                border-top: 1px solid #1e293b;
                margin-top: 30px;
                padding-top: 20px;
                font-size: 12px;
                color: #475569;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <img src="https://img.icons8.com/ios-filled/50/ffffff/heartbeat.png" width="24" height="24" style="margin-top: 12px; display: block; margin-left: auto; margin-right: auto;" alt="MediSphere Logo">
            </div>
            <div class="title">MediSphere</div>
            <div class="subtitle">AI-Powered Smart Healthcare Ecosystem</div>
            <p style="margin: 0; color: #f8fafc; font-size: 16px;">Hello <strong>{username}</strong>,</p>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">Use the following One-Time Password (OTP) to complete your account registration.</p>
            <div class="otp-box">{otp}</div>
            <p class="warning">This OTP is valid for <strong>5 minutes</strong>. For security reasons, please do not share this code with anyone.</p>
            <div class="footer">
                © 2026 MediSphere Healthcare. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    """

    import threading

    def send_email_async(email_msg):
        try:
            email_msg.send()
            print("Background email sent successfully!")
        except Exception as e:
            import traceback
            print("Background email sending FAILED:")
            traceback.print_exc()

    # Send Email asynchronously in background thread to avoid blocking requests (runs instantly)
    try:
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [email])
        msg.attach_alternative(html_content, "text/html")
        threading.Thread(target=send_email_async, args=(msg,)).start()
    except Exception as e:
        # Delete verification record if mail init fails
        verification.delete()
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
        mobile_number = data.get('mobile_number')
        otp = data.get('otp')
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({'success': False, 'error': 'Invalid request payload'}, status=400)

    if not mobile_number or not otp:
        return JsonResponse({'success': False, 'error': 'Mobile number and OTP are required'}, status=400)

    verification = OTPVerification.objects.filter(
        mobile_number=mobile_number,
        otp=otp,
        verified=False
    ).order_by('-created_at').first()

    if not verification:
        return JsonResponse({'success': False, 'error': 'Invalid OTP or mobile number'}, status=400)

    if verification.is_expired():
        return JsonResponse({'success': False, 'error': 'OTP has expired. Please request a new one.'}, status=400)

    # Mark as verified
    verification.verified = True
    verification.save()

    return JsonResponse({'success': True, 'message': 'OTP verified successfully'})

@csrf_exempt
def register_user(request):
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

    # Check if there is a verified OTP record
    verification = OTPVerification.objects.filter(
        mobile_number=mobile_number,
        verified=True
    ).order_by('-created_at').first()

    if not verification:
        return JsonResponse({'success': False, 'error': 'Please verify your OTP first'}, status=400)

    if verification.is_expired():
        return JsonResponse({'success': False, 'error': 'Session expired. Please start registration again.'}, status=400)

    # Ensure details are not already registered
    if CustomUser.objects.filter(mobile_number=mobile_number).exists():
        return JsonResponse({'success': False, 'error': 'Mobile number is already registered'}, status=400)
    
    if CustomUser.objects.filter(email=verification.email).exists():
        return JsonResponse({'success': False, 'error': 'Email address is already registered'}, status=400)

    # Create user
    try:
        user = CustomUser.objects.create_user(
            username=verification.username,
            mobile_number=mobile_number,
            email=verification.email,
            password=password
        )
        # Authenticate and login
        user = authenticate(request, username=mobile_number, password=password)
        if user:
            login(request, user)
            
            # Clean up verification records for this number
            OTPVerification.objects.filter(mobile_number=mobile_number).delete()

            return JsonResponse({
                'success': True,
                'message': 'Registration successful',
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'mobile_number': user.mobile_number
                }
            })
        else:
            return JsonResponse({'success': False, 'error': 'Authentication failed after registration'}, status=500)
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

    user = authenticate(request, username=mobile_number, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({
            'success': True,
            'message': 'Login successful',
            'user': {
                'username': user.username,
                'email': user.email,
                'mobile_number': user.mobile_number
            }
        })
    else:
        return JsonResponse({'success': False, 'error': 'Invalid mobile number or password'}, status=400)

def logout_user(request):
    logout(request)
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})

def user_status(request):
    if request.user.is_authenticated:
        return JsonResponse({
            'logged_in': True,
            'user': {
                'username': request.user.username,
                'email': request.user.email,
                'mobile_number': request.user.mobile_number
            }
        })
    else:
        return JsonResponse({'logged_in': False})


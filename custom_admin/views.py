from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from django.http import JsonResponse
from accounts.models import UserProfile, ActivityLog
from medicines.models import Medicine
from accounts.views import log_activity

@csrf_protect
def admin_login(request):
    user_id = request.session.get('user_id')
    if user_id:
        try:
            profile = UserProfile.objects.get(id=user_id)
            if profile.user_type == 'admin':
                return redirect('/backend/')
        except UserProfile.DoesNotExist:
            pass

    error = None
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Default admin credentials check
        if username == 'admin' and password == 'Admin':
            profile, created = UserProfile.objects.get_or_create(
                email='admin@medisphere.com',
                defaults={
                    'name': 'Admin',
                    'mobile_number': '0000000000',
                    'password': make_password('Admin'),
                    'user_type': 'admin',
                }
            )
            if not created:
                profile.password = make_password('Admin')
                profile.user_type = 'admin'
                profile.name = 'Admin'
                profile.save()
            request.session['user_id'] = profile.id
            from accounts.views import log_activity
            log_activity(request, profile.email, "Admin login successful (default credentials)")
            return redirect('/backend/')

        # Query user profile from database
        try:
            profile = UserProfile.objects.get(email=username, user_type='admin')
            if check_password(password, profile.password):
                request.session['user_id'] = profile.id
                from accounts.views import log_activity
                log_activity(request, profile.email, "Admin login successful")
                return redirect('/backend/')
            else:
                error = "Invalid username or password."
        except UserProfile.DoesNotExist:
            # Fallback check by mobile number
            try:
                profile = UserProfile.objects.get(mobile_number=username, user_type='admin')
                if check_password(password, profile.password):
                    request.session['user_id'] = profile.id
                    from accounts.views import log_activity
                    log_activity(request, profile.email, "Admin login successful")
                    return redirect('/backend/')
                else:
                    error = "Invalid username or password."
            except UserProfile.DoesNotExist:
                error = "Invalid username or password."

    return render(request, 'custom_admin/login.html', {'error': error})

def admin_dashboard(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('/backend/login/')
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return redirect('/backend/login/')
    except UserProfile.DoesNotExist:
        return redirect('/backend/login/')
        
    # Dynamic database tables check and auto-migration run to ensure Report and ReportParameter exist
    try:
        from django.core.management import call_command
        from django.db import connection
        
        cursor = connection.cursor()
        
        # Check if django_migrations table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='django_migrations';")
        has_migrations_table = cursor.fetchone()
        
        needs_migration = True
        if has_migrations_table:
            cursor.execute("SELECT name FROM django_migrations WHERE app='custom_admin' AND name='0004_report_reportparameter_delete_customreport';")
            if cursor.fetchone():
                needs_migration = False
        
        if needs_migration:
            # Drop reports and report_parameters if they were created via raw SQL previously, to avoid migration conflicts
            try:
                cursor.execute("DROP TABLE IF EXISTS report_parameters;")
                cursor.execute("DROP TABLE IF EXISTS reports;")
                cursor.execute("DROP TABLE IF EXISTS custom_reports;")
                connection.commit()
            except Exception as drop_err:
                print(f"Error dropping conflicting tables: {drop_err}")
            
            # Execute Django migrations programmatically
            call_command('migrate', interactive=False)
            print("Successfully ran Django migrations programmatically.")
    except Exception as db_err:
        print(f"Auto-migration failed: {db_err}")

    return render(request, 'custom_admin/dashboard.html')


@csrf_exempt
def admin_metrics(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    total_users = UserProfile.objects.exclude(user_type='admin').count()
    citizens = UserProfile.objects.filter(user_type='citizen').count()
    doctors = UserProfile.objects.filter(user_type='doctor').count()
    pharmacies = UserProfile.objects.filter(user_type='pharmacy').count()
    medicines = Medicine.objects.count()
    logs = ActivityLog.objects.count()

    try:
        from diseases.models import Disease
        diseases = Disease.objects.count()
    except Exception:
        diseases = 0

    try:
        from accounts.models import HelpdeskTicket
        helpdesk_requested = HelpdeskTicket.objects.filter(status='requested').count()
    except Exception:
        helpdesk_requested = 0

    try:
        from .models import Report
        reports = Report.objects.count()
    except Exception:
        reports = 0

    return JsonResponse({
        'total_users': total_users,
        'citizens': citizens,
        'doctors': doctors,
        'pharmacies': pharmacies,
        'medicines': medicines,
        'diseases': diseases,
        'logs': logs,
        'helpdesk_requested': helpdesk_requested,
        'reports': reports
    })


def admin_users_list(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    users = UserProfile.objects.exclude(user_type='admin').order_by('-date_joined')
    user_data = []
    for u in users:
        user_data.append({
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'mobile_number': u.mobile_number,
            'user_type': u.user_type,
            'license_number': u.license_number or '-',
            'address': u.address or '-',
            'city': u.city or '-',
            'state': u.state or '-',
            'pincode': u.pincode or '-',
            'is_approved': u.is_approved,
            'date_joined': u.date_joined.strftime('%Y-%m-%d %H:%M:%S') if u.date_joined else ''
        })
    return JsonResponse({'success': True, 'users': user_data})


def admin_pending_verifications(request):
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=current_user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    pending_users = UserProfile.objects.filter(is_approved=False).order_by('-date_joined')
    user_data = []
    for u in pending_users:
        user_data.append({
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'mobile_number': u.mobile_number,
            'user_type': u.user_type,
            'license_number': u.license_number or '-',
            'address': u.address or '-',
            'city': u.city or '-',
            'state': u.state or '-',
            'pincode': u.pincode or '-',
            'date_joined': u.date_joined.strftime('%Y-%m-%d %H:%M:%S') if u.date_joined else ''
        })
    return JsonResponse({'success': True, 'users': user_data})


@csrf_exempt
def admin_approve_user(request, user_id):
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=current_user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    try:
        target_user = UserProfile.objects.get(id=user_id)
        target_user.is_approved = True
        target_user.save()

        # Log this admin action
        log_activity(request, profile.email, f"Approved user account: {target_user.email} ({target_user.user_type})")

        return JsonResponse({'success': True, 'message': f'User {target_user.name} approved successfully.'})
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found.'}, status=404)


def admin_logs_list(request):
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=current_user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    logs = ActivityLog.objects.all().order_by('-timestamp')[:100]
    log_data = []
    for l in logs:
        name = l.user_name
        if not name or name == '-':
            # Dynamic fallback lookup by email
            if l.user_email:
                try:
                    profile = UserProfile.objects.get(email=l.user_email)
                    name = profile.name
                    # Persist name to DB log entry
                    l.user_name = name
                    l.save()
                except UserProfile.DoesNotExist:
                    name = '-'
            else:
                name = 'System / Guest'
        
        log_data.append({
            'id': l.id,
            'user_name': name or '-',
            'user_email': l.user_email or 'System / Guest',
            'action': l.action,
            'timestamp': l.timestamp.isoformat() if l.timestamp else ''
        })
    return JsonResponse({'success': True, 'logs': log_data})

import json
from accounts.models import HelpdeskTicket

def admin_helpdesk_list(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    tickets = HelpdeskTicket.objects.all().order_by('-created_at')
    
    def get_shortcode(name):
        cleaned = "".join([c for c in name if c.isalpha()]).upper()
        if len(cleaned) >= 3:
            return cleaned[:3]
        return (cleaned + "TKT")[:3]
        
    ticket_data = []
    for t in tickets:
        shortcode = get_shortcode(t.sender_name)
        ticket_data.append({
            'id': t.id,
            'ticket_code': f"{shortcode}{t.id:03d}",
            'sender_email': t.sender_email,
            'sender_name': t.sender_name,
            'sender_type': t.sender_type,
            'message': t.message,
            'status': t.status,
            'created_at': t.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return JsonResponse({'success': True, 'tickets': ticket_data})

@csrf_exempt
def admin_helpdesk_resolve(request, ticket_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)

    try:
        ticket = HelpdeskTicket.objects.get(id=ticket_id)
        ticket.status = 'resolved'
        ticket.save()

        # Log this admin action
        log_activity(request, profile.email, f"Resolved helpdesk ticket #{ticket.id} from {ticket.sender_email}")

        return JsonResponse({'success': True, 'message': 'Ticket marked as resolved successfully.'})
    except HelpdeskTicket.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Ticket not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_helpdesk_open(request, ticket_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)

    try:
        ticket = HelpdeskTicket.objects.get(id=ticket_id)
        ticket.status = 'open'
        ticket.save()

        # Log this admin action
        log_activity(request, profile.email, f"Opened helpdesk ticket #{ticket.id} from {ticket.sender_email}")

        return JsonResponse({'success': True, 'message': 'Ticket opened successfully.'})
    except HelpdeskTicket.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Ticket not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_helpdesk_reject(request, ticket_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)

    try:
        ticket = HelpdeskTicket.objects.get(id=ticket_id)
        ticket.status = 'rejected'
        ticket.save()

        # Log this admin action
        log_activity(request, profile.email, f"Rejected helpdesk ticket #{ticket.id} from {ticket.sender_email}")

        return JsonResponse({'success': True, 'message': 'Ticket rejected successfully.'})
    except HelpdeskTicket.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Ticket not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


def admin_diseases_list(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

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


@csrf_exempt
def admin_disease_add(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        import json
        data = json.loads(request.body)
        name = data.get('name')
        description = data.get('description', '')
        causes = data.get('causes', '')
        symptoms = data.get('symptoms', '')
        risk_factors = data.get('risk_factors', '')
        complications = data.get('complications', '')
        treatment = data.get('treatment', '')
        medicine = data.get('medicine', '')

        if not name:
            return JsonResponse({'success': False, 'error': 'Disease name is required.'}, status=400)

        from diseases.models import Disease
        disease = Disease.objects.create(
            name=name,
            description=description,
            causes=causes,
            symptoms=symptoms,
            risk_factors=risk_factors,
            complications=complications,
            treatment=treatment,
            medicine=medicine
        )

        # Log this admin action
        from accounts.views import log_activity
        log_activity(request, profile.email, f"Added disease: {name}")

        return JsonResponse({'success': True, 'message': 'Disease added successfully.', 'disease_id': disease.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_disease_edit(request, disease_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        import json
        data = json.loads(request.body)
        name = data.get('name')
        description = data.get('description', '')
        causes = data.get('causes', '')
        symptoms = data.get('symptoms', '')
        risk_factors = data.get('risk_factors', '')
        complications = data.get('complications', '')
        treatment = data.get('treatment', '')
        medicine = data.get('medicine', '')

        if not name:
            return JsonResponse({'success': False, 'error': 'Disease name is required.'}, status=400)

        from diseases.models import Disease
        disease = Disease.objects.get(id=disease_id)
        disease.name = name
        disease.description = description
        disease.causes = causes
        disease.symptoms = symptoms
        disease.risk_factors = risk_factors
        disease.complications = complications
        disease.treatment = treatment
        disease.medicine = medicine
        disease.save()

        # Log this admin action
        from accounts.views import log_activity
        log_activity(request, profile.email, f"Edited disease: {name}")

        return JsonResponse({'success': True, 'message': 'Disease updated successfully.'})
    except Disease.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Disease not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_disease_delete(request, disease_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        from diseases.models import Disease
        disease = Disease.objects.get(id=disease_id)
        name = disease.name
        disease.delete()

        # Log this admin action
        from accounts.views import log_activity
        log_activity(request, profile.email, f"Deleted disease: {name}")

        return JsonResponse({'success': True, 'message': 'Disease deleted successfully.'})
    except Disease.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Disease not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_medicines_list(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    try:
        from medicines.models import Medicine
        medicines = Medicine.objects.all().order_by('name')
        medicine_data = []
        for m in medicines:
            medicine_data.append({
                'id': m.id,
                'name': m.name,
                'manufacturer': m.manufacturer,
                'category': m.category,
                'pack_size': m.pack_size,
                'uses': m.uses or '',
                'side_effects': m.side_effects or '',
                'image_url': m.image_url or ''
            })
        return JsonResponse({'success': True, 'medicines': medicine_data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


def download_medicine_image(url, medicine_name):
    if not url or url.startswith('/static/'):
        return url
    
    try:
        import urllib.request
        import os
        from django.utils.text import slugify
        
        # Create output directory
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        dest_dir = os.path.join(base_dir, 'portal', 'static', 'uploads', 'medicines')
        os.makedirs(dest_dir, exist_ok=True)
        
        # Get extension
        from urllib.parse import urlparse
        parsed = urlparse(url)
        path = parsed.path
        ext = os.path.splitext(path)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']:
            ext = '.jpg'
            
        # Clean file name
        import uuid
        filename = f"{slugify(medicine_name)}_{uuid.uuid4().hex[:8]}{ext}"
        filepath = os.path.join(dest_dir, filename)
        
        # Download
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            with open(filepath, 'wb') as out_file:
                out_file.write(response.read())
                
        return f"/static/uploads/medicines/{filename}"
    except Exception as e:
        print(f"Error downloading image from {url}: {e}")
        return url


def download_image_async(medicine_id, url, medicine_name):
    try:
        downloaded_url = download_medicine_image(url, medicine_name)
        if downloaded_url != url:
            from medicines.models import Medicine
            med = Medicine.objects.get(id=medicine_id)
            med.image_url = downloaded_url
            med.save()
    except Exception as e:
        print(f"Async image download failed: {e}")


@csrf_exempt
def admin_medicine_add(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        import json
        data = json.loads(request.body)
        name = data.get('name')
        manufacturer = data.get('manufacturer')
        category = data.get('category', 'tablet')
        pack_size = data.get('pack_size', '10 Tablets')
        uses = data.get('uses', '')
        side_effects = data.get('side_effects', '')
        image_url = data.get('image_url', '')

        if not name or not manufacturer:
            return JsonResponse({'success': False, 'error': 'Name and manufacturer are required.'}, status=400)

        from medicines.models import Medicine
        medicine = Medicine.objects.create(
            name=name,
            manufacturer=manufacturer,
            category=category,
            pack_size=pack_size,
            uses=uses,
            side_effects=side_effects,
            image_url=image_url
        )

        # Log this admin action
        from accounts.views import log_activity
        log_activity(request, profile.email, f"Added medicine: {name} by {manufacturer}")

        return JsonResponse({'success': True, 'message': 'Medicine added successfully.', 'medicine_id': medicine.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_medicine_edit(request, medicine_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        import json
        data = json.loads(request.body)
        name = data.get('name')
        manufacturer = data.get('manufacturer')
        category = data.get('category', 'tablet')
        pack_size = data.get('pack_size', '10 Tablets')
        uses = data.get('uses', '')
        side_effects = data.get('side_effects', '')
        image_url = data.get('image_url', '')

        if not name or not manufacturer:
            return JsonResponse({'success': False, 'error': 'Name and manufacturer are required.'}, status=400)

        from medicines.models import Medicine
        medicine = Medicine.objects.get(id=medicine_id)
        old_image_url = medicine.image_url

        medicine.name = name
        medicine.manufacturer = manufacturer
        medicine.category = category
        medicine.pack_size = pack_size
        medicine.uses = uses
        medicine.side_effects = side_effects

        medicine.image_url = image_url
        medicine.save()

        # Log this admin action
        from accounts.views import log_activity
        log_activity(request, profile.email, f"Edited medicine: {name} by {manufacturer}")

        return JsonResponse({'success': True, 'message': 'Medicine updated successfully.'})
    except Medicine.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Medicine not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_medicine_delete(request, medicine_id):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        from medicines.models import Medicine
        medicine = Medicine.objects.get(id=medicine_id)
        name = medicine.name
        manufacturer = medicine.manufacturer
        medicine.delete()

        # Log this admin action
        from accounts.views import log_activity
        log_activity(request, profile.email, f"Deleted medicine: {name} by {manufacturer}")

        return JsonResponse({'success': True, 'message': 'Medicine deleted successfully.'})
    except Medicine.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Medicine not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_user_delete(request, user_id):
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=current_user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        user = UserProfile.objects.get(id=user_id)
        email = user.email
        user.delete()

        # Log this admin action
        from accounts.views import log_activity
        log_activity(request, profile.email, f"Deleted user account: {email}")

        return JsonResponse({'success': True, 'message': 'User deleted successfully.'})
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_log_delete(request, log_id):
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=current_user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        log_item = ActivityLog.objects.get(id=log_id)
        log_item.delete()

        return JsonResponse({'success': True, 'message': 'Log entry deleted successfully.'})
    except ActivityLog.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Log not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_helpdesk_delete(request, ticket_id):
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=current_user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        ticket = HelpdeskTicket.objects.get(id=ticket_id)
        ticket.status = 'deleted'
        ticket.save()
        return JsonResponse({'success': True, 'message': 'Ticket deleted successfully.'})
    except HelpdeskTicket.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Ticket not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


def admin_reports_list(request):
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=current_user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    try:
        from .models import Report
        reports = Report.objects.all().order_by('-id')
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
                'created_at': r.created_at.strftime('%Y-%m-%d %H:%M:%S') if r.created_at else ''
            })
        return JsonResponse({'success': True, 'reports': report_list})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_report_add(request):
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=current_user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        import json
        from .models import Report, ReportParameter
        from accounts.views import log_activity

        data = json.loads(request.body)
        name = data.get('name', '').strip()
        short_name = data.get('short_name', '').strip()
        category = data.get('category', '').strip()
        description = data.get('description', '').strip()
        parameters = data.get('parameters', [])

        if not name or not short_name or not category:
            return JsonResponse({'success': False, 'error': 'Report Name, Short Name, and Category are required.'}, status=400)

        if not parameters or len(parameters) == 0:
            return JsonResponse({'success': False, 'error': 'At least one parameter is required.'}, status=400)

        report = Report.objects.create(name=name, short_name=short_name, category=category, description=description)

        for p in parameters:
            ReportParameter.objects.create(
                report=report,
                parameter=p.get('parameter', '').strip(),
                unit=p.get('unit', '').strip(),
                male_min=p.get('male_min', '').strip(),
                male_max=p.get('male_max', '').strip(),
                female_min=p.get('female_min', '').strip(),
                female_max=p.get('female_max', '').strip(),
            )

        log_activity(request, profile.email, f"Added report: {name} ({short_name})")
        return JsonResponse({'success': True, 'message': 'Report added successfully.', 'report_id': report.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_report_edit(request, report_id):
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=current_user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        import json
        from .models import Report, ReportParameter
        from accounts.views import log_activity

        data = json.loads(request.body)
        name = data.get('name', '').strip()
        short_name = data.get('short_name', '').strip()
        category = data.get('category', '').strip()
        description = data.get('description', '').strip()
        parameters = data.get('parameters', [])

        if not name or not short_name or not category:
            return JsonResponse({'success': False, 'error': 'Report Name, Short Name, and Category are required.'}, status=400)

        if not parameters or len(parameters) == 0:
            return JsonResponse({'success': False, 'error': 'At least one parameter is required.'}, status=400)

        report = Report.objects.get(id=report_id)
        report.name = name
        report.short_name = short_name
        report.category = category
        report.description = description
        report.save()

        # Delete old parameters and re-create
        report.parameters.all().delete()
        for p in parameters:
            ReportParameter.objects.create(
                report=report,
                parameter=p.get('parameter', '').strip(),
                unit=p.get('unit', '').strip(),
                male_min=p.get('male_min', '').strip(),
                male_max=p.get('male_max', '').strip(),
                female_min=p.get('female_min', '').strip(),
                female_max=p.get('female_max', '').strip(),
            )

        log_activity(request, profile.email, f"Edited report: {name} ({short_name})")
        return JsonResponse({'success': True, 'message': 'Report updated successfully.'})
    except Report.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Report not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def admin_report_delete(request, report_id):
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        profile = UserProfile.objects.get(id=current_user_id)
        if profile.user_type != 'admin':
            return JsonResponse({'success': False, 'error': 'Forbidden'}, status=403)
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)

    try:
        from .models import Report
        from accounts.views import log_activity

        report = Report.objects.get(id=report_id)
        name = report.name
        report.delete()

        log_activity(request, profile.email, f"Deleted report: {name}")
        return JsonResponse({'success': True, 'message': 'Report deleted successfully.'})
    except Report.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Report not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


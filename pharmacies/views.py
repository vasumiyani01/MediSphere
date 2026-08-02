import os
import json
import datetime
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.utils import timezone
from accounts.models import UserProfile, ActivityLog
from accounts.views import log_activity

def pharmacy_dashboard(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('/')
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'pharmacy':
            dest = 'pharmacies' if profile.user_type == 'pharmacy' else f'{profile.user_type}s'
            return redirect(f'/{dest}/')
    except UserProfile.DoesNotExist:
        return redirect('/')
    
    return render(request, 'pharmacies/dashboard.html')


@csrf_exempt
def update_pharmacy_profile(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method is allowed'}, status=405)
    
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)

    try:
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("PRAGMA table_info(users);")
        columns = [row[1] for row in cursor.fetchall()]
        if 'open_from' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN open_from VARCHAR(5) NULL;")
        if 'closes_from' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN closes_from VARCHAR(5) NULL;")
        if 'checkout_option' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN checkout_option VARCHAR(50) NULL;")
    except Exception as db_err:
        print(f"Safe check failed: {db_err}")
        
    try:
        profile = UserProfile.objects.get(id=user_id)
        if profile.user_type != 'pharmacy':
            return JsonResponse({'success': False, 'error': 'Access denied: not a pharmacy'}, status=403)
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
        open_from = data.get('open_from', '').strip()
        closes_from = data.get('closes_from', '').strip()
        checkout_option = data.get('checkout_option', '').strip()
        
        if not (name and mobile_number and email and address and city and state and pincode and open_from and closes_from and checkout_option):
            return JsonResponse({'success': False, 'error': 'All fields are required to complete your profile'}, status=400)
            
        # Check if the mobile number is already taken by another user
        if UserProfile.objects.filter(mobile_number=mobile_number).exclude(id=profile.id).exists():
            return JsonResponse({'success': False, 'error': 'Mobile number is already in use by another user.'}, status=400)
            
        # Check if email is already taken by another user
        if UserProfile.objects.filter(email=email).exclude(id=profile.id).exists():
            return JsonResponse({'success': False, 'error': 'Email is already in use by another user.'}, status=400)
            
        profile.name = name
        profile.mobile_number = mobile_number
        profile.email = email
        profile.address = address
        profile.city = city
        profile.state = state
        profile.pincode = pincode
        profile.open_from = open_from
        profile.closes_from = closes_from
        profile.checkout_option = checkout_option
        profile.save()
        
        log_activity(request, profile.email, "Pharmacy profile completed/updated")
        
        return JsonResponse({
            'success': True, 
            'message': 'Profile updated successfully!',
            'user': {
                'name': profile.name,
                'username': profile.name,
                'email': profile.email,
                'mobile_number': profile.mobile_number,
                'user_type': profile.user_type,
                'license_number': profile.license_number,
                'address': profile.address,
                'city': profile.city,
                'state': profile.state,
                'pincode': profile.pincode,
                'open_from': profile.open_from,
                'closes_from': profile.closes_from,
                'checkout_option': profile.checkout_option
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def pharmacy_inventory_list(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        
    try:
        from django.db import connection
        cursor = connection.cursor()
        
        # Query inventory join with medicines table
        cursor.execute("""
            SELECT pi.id, m.name, m.manufacturer, m.category, pi.mfg_date, pi.expiry_date, pi.stock, pi.price, m.image_url, pi.medicine_id
            FROM inventory pi
            JOIN medicines m ON pi.medicine_id = m.id
            WHERE pi.user_id = %s
            ORDER BY pi.id DESC
        """, (user_id,))
        
        rows = cursor.fetchall()
        inventory = []
        for r in rows:
            category_db = r[3] or 'tablet'
            category_display = category_db.capitalize()
            if category_display == 'Other':
                category_display = 'Injection'
            
            inventory.append({
                'id': r[0],
                'name': r[1],
                'manufacturer': r[2],
                'category': category_display,
                'mfg_date': r[4],
                'expiry_date': r[5],
                'quantity': r[6],
                'price': r[7],
                'image_url': r[8] or '',
                'medicine_id': r[9]
            })
            
        return JsonResponse({'success': True, 'inventory': inventory})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def pharmacy_inventory_add(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)
        
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        
    try:
        data = json.loads(request.body)
        medicine_id = data.get('medicine_id')
        mfg_date_str = data.get('mfg_date')
        expiry_date_str = data.get('expiry_date')
        stock = data.get('stock')
        price = data.get('price')
        
        if not (medicine_id and mfg_date_str and expiry_date_str and stock is not None and price is not None):
            return JsonResponse({'success': False, 'error': 'All fields are required.'}, status=400)
            
        try:
            stock = int(stock)
            price = float(price)
        except ValueError:
            return JsonResponse({'success': False, 'error': 'Stock must be integer and price must be float.'}, status=400)
            
        if stock < 0 or price < 0.0:
            return JsonResponse({'success': False, 'error': 'Stock and Price cannot be below 0.'}, status=400)
            
        try:
            mfg_date = datetime.date.fromisoformat(mfg_date_str)
            expiry_date = datetime.date.fromisoformat(expiry_date_str)
        except ValueError:
            return JsonResponse({'success': False, 'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
            
        today = datetime.date.today()
        if mfg_date > today:
            return JsonResponse({'success': False, 'error': 'Manufacturing date cannot be in the future.'}, status=400)
        if expiry_date <= today:
            return JsonResponse({'success': False, 'error': 'Expiry date must be in the future (greater than today).'}, status=400)
        if expiry_date <= mfg_date:
            return JsonResponse({'success': False, 'error': 'Expiry date cannot be before or equal to the Manufacturing date.'}, status=400)
            
        from django.db import connection
        cursor = connection.cursor()
        
        cursor.execute("SELECT id FROM medicines WHERE id = %s", (medicine_id,))
        if not cursor.fetchone():
            return JsonResponse({'success': False, 'error': 'Medicine not found.'}, status=404)
            
        created_at_now = timezone.now().isoformat()
        cursor.execute("""
            INSERT INTO inventory (user_id, medicine_id, mfg_date, expiry_date, stock, price, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user_id, medicine_id, mfg_date_str, expiry_date_str, stock, price, created_at_now))
        
        return JsonResponse({'success': True, 'message': 'Medicine added to inventory successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def pharmacy_inventory_edit(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        data = json.loads(request.body)
        item_id = data.get('id')
        stock = data.get('stock')
        price = data.get('price')
        mfg_date_str = data.get('mfg_date')
        expiry_date_str = data.get('expiry_date')
        
        if item_id is None or stock is None or price is None or not mfg_date_str or not expiry_date_str:
            return JsonResponse({'success': False, 'error': 'Missing fields'}, status=400)
            
        try:
            stock = int(stock)
            price = float(price)
        except ValueError:
            return JsonResponse({'success': False, 'error': 'Stock must be integer and price must be float.'}, status=400)
            
        if stock < 0 or price < 0.0:
            return JsonResponse({'success': False, 'error': 'Stock and Price cannot be below 0.'}, status=400)
            
        try:
            mfg_date = datetime.date.fromisoformat(mfg_date_str)
            expiry_date = datetime.date.fromisoformat(expiry_date_str)
        except ValueError:
            return JsonResponse({'success': False, 'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
            
        today = datetime.date.today()
        if mfg_date > today:
            return JsonResponse({'success': False, 'error': 'Manufacturing date cannot be in the future.'}, status=400)
        if expiry_date <= today:
            return JsonResponse({'success': False, 'error': 'Expiry date must be in the future (greater than today).'}, status=400)
        if expiry_date <= mfg_date:
            return JsonResponse({'success': False, 'error': 'Expiry date cannot be before or equal to the Manufacturing date.'}, status=400)
            
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE inventory 
            SET stock = %s, price = %s, mfg_date = %s, expiry_date = %s 
            WHERE id = %s AND user_id = %s
        """, (stock, price, mfg_date_str, expiry_date_str, item_id, user_id))
        return JsonResponse({'success': True, 'message': 'Inventory item updated successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def pharmacy_inventory_delete(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        data = json.loads(request.body)
        item_id = data.get('id')
        if item_id is None:
            return JsonResponse({'success': False, 'error': 'Missing item ID'}, status=400)
            
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("DELETE FROM inventory WHERE id = %s AND user_id = %s", (item_id, user_id))
        return JsonResponse({'success': True, 'message': 'Inventory item deleted successfully.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ============ POS BILLING VIEWS ============

@csrf_exempt
def list_citizens(request):
    """List all registered citizen users to link as customers."""
    if request.method != 'GET':
        return JsonResponse({'success': False, 'error': 'Only GET is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        citizens = UserProfile.objects.filter(user_type='citizen').order_by('name')
        citizen_list = []
        for c in citizens:
            citizen_list.append({
                'id': c.id,
                'name': c.name,
                'email': c.email
            })
        return JsonResponse({'success': True, 'citizens': citizen_list})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def list_bills(request):
    """List all POS bills/invoices for the logged-in pharmacy."""
    if request.method != 'GET':
        return JsonResponse({'success': False, 'error': 'Only GET is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        from django.db import connection
        cursor = connection.cursor()
        
        # Get pharmacy profile to generate shortcode
        profile = UserProfile.objects.get(id=user_id)
        
        def get_shortcode(name):
            cleaned = "".join([c for c in name if c.isalpha()]).upper()
            if len(cleaned) >= 3:
                return cleaned[:3]
            return (cleaned + "PHR")[:3]
            
        shortcode = get_shortcode(profile.name)
        
        # Query bills header
        cursor.execute("""
            SELECT id, customer_name, total_price, bill_type, payment_method, bill_date, user_id, subtotal, sgst, cgst, discount
            FROM bills
            WHERE pharmacy_id = %s
            ORDER BY id DESC
        """, (user_id,))
        
        bills_list = []
        for row in cursor.fetchall():
            bill_id = row[0]
            bill_no = f"{shortcode}O{bill_id:04d}"
            
            # Fetch items for this bill
            item_cursor = connection.cursor()
            item_cursor.execute("""
                SELECT bi.medicine_id, m.name, bi.quantity, bi.price
                FROM bill_items bi
                JOIN medicines m ON bi.medicine_id = m.id
                WHERE bi.bill_id = %s
            """, (bill_id,))
            
            items = []
            med_names = []
            total_qty = 0
            for item_row in item_cursor.fetchall():
                items.append({
                    'medicine_id': item_row[0],
                    'medicine_name': item_row[1],
                    'quantity': item_row[2],
                    'price': item_row[3],
                    'subtotal': item_row[2] * item_row[3]
                })
                med_names.append(f"{item_row[1]} x{item_row[2]}")
                total_qty += item_row[2]
            
            bills_list.append({
                'id': bill_id,
                'bill_no': bill_no,
                'customer_name': row[1],
                'medicine_name': ", ".join(med_names) if med_names else "No items",
                'quantity': total_qty,
                'total_price': row[2],
                'bill_type': row[3],
                'payment_method': row[4],
                'bill_date': row[5],
                'user_id': row[6],
                'subtotal': row[7] if len(row) > 7 else row[2],
                'sgst': row[8] if len(row) > 8 else 0.0,
                'cgst': row[9] if len(row) > 9 else 0.0,
                'discount': row[10] if len(row) > 10 else 0.0,
                'items': items
            })
        return JsonResponse({'success': True, 'bills': bills_list})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def add_bill(request):
    """Create a new bill/invoice with multiple items."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        data = json.loads(request.body)
        customer_name = data.get('customer_name', '').strip()
        user_id_linked = data.get('user_id')
        bill_type = data.get('bill_type', 'in store').strip()
        payment_method = data.get('payment_method', 'Cash').strip()
        bill_date = data.get('bill_date', '').strip()
        items = data.get('items', [])
        sgst = float(data.get('sgst', 0.0) or 0.0)
        cgst = float(data.get('cgst', 0.0) or 0.0)
        discount = float(data.get('discount', 0.0) or 0.0)
        
        if not customer_name or not bill_date or not items:
            return JsonResponse({'success': False, 'error': 'Missing required fields or items list.'}, status=400)
            
        if bill_type not in ('online', 'in store'):
            return JsonResponse({'success': False, 'error': 'Invalid bill type.'}, status=400)
            
        if sgst < 0 or cgst < 0 or discount < 0:
            return JsonResponse({'success': False, 'error': 'SGST, CGST, and Discount must be non-negative.'}, status=400)
            
        from django.db import connection
        cursor = connection.cursor()
        
        # Calculate subtotal price and validate items
        subtotal = 0.0
        validated_items = []
        for item in items:
            med_id = item.get('medicine_id')
            qty = item.get('quantity')
            if not med_id or qty is None:
                return JsonResponse({'success': False, 'error': 'Each item must have a medicine_id and quantity.'}, status=400)
            try:
                qty = int(qty)
                if qty <= 0:
                    raise ValueError
            except ValueError:
                return JsonResponse({'success': False, 'error': 'Quantity must be a positive integer.'}, status=400)
                
            # Fetch inventory price to verify price
            cursor.execute("SELECT price, stock FROM inventory WHERE medicine_id = %s AND user_id = %s", (med_id, user_id))
            inv_row = cursor.fetchone()
            if not inv_row:
                return JsonResponse({'success': False, 'error': f'Medicine ID {med_id} not found in your inventory.'}, status=400)
            
            price = float(inv_row[0])
            subtotal += price * qty
            validated_items.append({
                'medicine_id': med_id,
                'quantity': qty,
                'price': price
            })
            
        sgst_amt = subtotal * (sgst / 100.0)
        cgst_amt = subtotal * (cgst / 100.0)
        discount_amt = subtotal * (discount / 100.0)
        grand_total = subtotal + sgst_amt + cgst_amt - discount_amt
            
        now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Insert bill header
        cursor.execute("""
            INSERT INTO bills (pharmacy_id, user_id, customer_name, subtotal, sgst, cgst, discount, total_price, bill_type, payment_method, bill_date, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, user_id_linked, customer_name, subtotal, sgst, cgst, discount, grand_total, bill_type, payment_method, bill_date, now_str))
        
        bill_id = cursor.lastrowid
        
        # Insert bill items and deduct inventory stock
        for item in validated_items:
            cursor.execute("""
                INSERT INTO bill_items (bill_id, medicine_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (bill_id, item['medicine_id'], item['quantity'], item['price']))
            
            # Deduct stock from inventory
            cursor.execute("""
                UPDATE inventory
                SET stock = MAX(0, stock - %s)
                WHERE medicine_id = %s AND user_id = %s
            """, (item['quantity'], item['medicine_id'], user_id))
            
        return JsonResponse({'success': True, 'message': 'Bill created successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def edit_bill(request):
    """Edit/update an existing bill/invoice and its items."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        data = json.loads(request.body)
        bill_id = data.get('id')
        customer_name = data.get('customer_name', '').strip()
        user_id_linked = data.get('user_id')
        bill_type = data.get('bill_type', '').strip()
        payment_method = data.get('payment_method', '').strip()
        bill_date = data.get('bill_date', '').strip()
        items = data.get('items', [])
        sgst = float(data.get('sgst', 0.0) or 0.0)
        cgst = float(data.get('cgst', 0.0) or 0.0)
        discount = float(data.get('discount', 0.0) or 0.0)
        
        if not bill_id or not customer_name or not bill_date or not items:
            return JsonResponse({'success': False, 'error': 'Missing required fields or items.'}, status=400)
            
        if bill_type not in ('online', 'in store'):
            return JsonResponse({'success': False, 'error': 'Invalid bill type.'}, status=400)
            
        if sgst < 0 or cgst < 0 or discount < 0:
            return JsonResponse({'success': False, 'error': 'SGST, CGST, and Discount must be non-negative.'}, status=400)
            
        from django.db import connection
        cursor = connection.cursor()
        
        # Verify bill exists and belongs to this pharmacy
        cursor.execute("SELECT id FROM bills WHERE id = %s AND pharmacy_id = %s", (bill_id, user_id))
        if not cursor.fetchone():
            return JsonResponse({'success': False, 'error': 'Bill not found or unauthorized.'}, status=404)
            
        # 1. Restore inventory stock from the old bill items
        cursor.execute("SELECT medicine_id, quantity FROM bill_items WHERE bill_id = %s", (bill_id,))
        old_items = cursor.fetchall()
        for old_med_id, old_qty in old_items:
            cursor.execute("""
                UPDATE inventory
                SET stock = stock + %s
                WHERE medicine_id = %s AND user_id = %s
            """, (old_qty, old_med_id, user_id))
            
        # 2. Delete old bill items
        cursor.execute("DELETE FROM bill_items WHERE bill_id = %s", (bill_id,))
        
        # 3. Validate new items and calculate subtotal
        subtotal = 0.0
        validated_items = []
        for item in items:
            med_id = item.get('medicine_id')
            qty = item.get('quantity')
            if not med_id or qty is None:
                return JsonResponse({'success': False, 'error': 'Each item must have a medicine_id and quantity.'}, status=400)
            try:
                qty = int(qty)
                if qty <= 0:
                    raise ValueError
            except ValueError:
                return JsonResponse({'success': False, 'error': 'Quantity must be a positive integer.'}, status=400)
                
            cursor.execute("SELECT price FROM inventory WHERE medicine_id = %s AND user_id = %s", (med_id, user_id))
            inv_row = cursor.fetchone()
            if not inv_row:
                return JsonResponse({'success': False, 'error': f'Medicine ID {med_id} not found in inventory.'}, status=400)
                
            price = float(inv_row[0])
            subtotal += price * qty
            validated_items.append({
                'medicine_id': med_id,
                'quantity': qty,
                'price': price
            })
            
        sgst_amt = subtotal * (sgst / 100.0)
        cgst_amt = subtotal * (cgst / 100.0)
        discount_amt = subtotal * (discount / 100.0)
        grand_total = subtotal + sgst_amt + cgst_amt - discount_amt
            
        # 4. Update bill header
        cursor.execute("""
            UPDATE bills
            SET customer_name = %s, user_id = %s, subtotal = %s, sgst = %s, cgst = %s, discount = %s, total_price = %s, bill_type = %s, payment_method = %s, bill_date = %s
            WHERE id = %s AND pharmacy_id = %s
        """, (customer_name, user_id_linked, subtotal, sgst, cgst, discount, grand_total, bill_type, payment_method, bill_date, bill_id, user_id))
        
        # 5. Insert new bill items and deduct stock
        for item in validated_items:
            cursor.execute("""
                INSERT INTO bill_items (bill_id, medicine_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (bill_id, item['medicine_id'], item['quantity'], item['price']))
            
            cursor.execute("""
                UPDATE inventory
                SET stock = MAX(0, stock - %s)
                WHERE medicine_id = %s AND user_id = %s
            """, (item['quantity'], item['medicine_id'], user_id))
            
        return JsonResponse({'success': True, 'message': 'Bill updated successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def delete_bill(request):
    """Delete a bill/invoice and restore inventory stock."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        data = json.loads(request.body)
        bill_id = data.get('id')
        if not bill_id:
            return JsonResponse({'success': False, 'error': 'Missing bill ID.'}, status=400)
            
        from django.db import connection
        cursor = connection.cursor()
        
        # Verify bill exists and belongs to pharmacy
        cursor.execute("SELECT id FROM bills WHERE id = %s AND pharmacy_id = %s", (bill_id, user_id))
        if not cursor.fetchone():
            return JsonResponse({'success': False, 'error': 'Bill not found or unauthorized.'}, status=404)
            
        # Restore inventory stock
        cursor.execute("SELECT medicine_id, quantity FROM bill_items WHERE bill_id = %s", (bill_id,))
        old_items = cursor.fetchall()
        for old_med_id, old_qty in old_items:
            cursor.execute("""
                UPDATE inventory
                SET stock = stock + %s
                WHERE medicine_id = %s AND user_id = %s
            """, (old_qty, old_med_id, user_id))
            
        # Delete bill
        cursor.execute("DELETE FROM bill_items WHERE bill_id = %s", (bill_id,))
        cursor.execute("DELETE FROM bills WHERE id = %s AND pharmacy_id = %s", (bill_id, user_id))
        
        return JsonResponse({'success': True, 'message': 'Bill deleted successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ============ ORDER VIEWS ============

@csrf_exempt
def place_order(request):
    """Place an order with multiple medicines from a pharmacy."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        data = json.loads(request.body)
        pharmacy_id = data.get('pharmacy_id')
        items = data.get('items', [])
        order_type = data.get('order_type', 'normal')
        delivery_method = data.get('delivery_method', 'pickup')
 
        if not pharmacy_id or not items or len(items) == 0:
            return JsonResponse({'success': False, 'error': 'Pharmacy and at least one medicine are required.'}, status=400)
 
        if order_type not in ('normal', 'urgent'):
            return JsonResponse({'success': False, 'error': 'Invalid order type.'}, status=400)
        if delivery_method not in ('pickup', 'delivery'):
            return JsonResponse({'success': False, 'error': 'Invalid delivery method.'}, status=400)
 
        from django.db import connection
        cursor = connection.cursor()

        # Ensure tables exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL UNIQUE,
                user_id INTEGER NOT NULL,
                pharmacy_id INTEGER NOT NULL,
                total_price REAL NOT NULL DEFAULT 0,
                order_type TEXT NOT NULL DEFAULT 'normal',
                delivery_method TEXT NOT NULL DEFAULT 'pickup',
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(pharmacy_id) REFERENCES users(id)
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                medicine_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                price REAL NOT NULL DEFAULT 0,
                FOREIGN KEY(order_id) REFERENCES orders(order_id),
                FOREIGN KEY(medicine_id) REFERENCES medicines(id)
            );
        """)

        # Get pharmacy short code (first 3 alphanumeric characters of pharmacy name, in uppercase)
        cursor.execute("SELECT name FROM users WHERE id = %s", (pharmacy_id,))
        pharm_row = cursor.fetchone()
        pharm_name = pharm_row[0] if pharm_row else "PHA"
        short_code = "".join(c for c in pharm_name if c.isalnum()).upper()[:3]
        if len(short_code) < 3:
            short_code = (short_code + "PHA")[:3]

        cursor.execute("SELECT COUNT(*) FROM orders WHERE pharmacy_id = %s", (pharmacy_id,))
        order_count = cursor.fetchone()[0]
        next_counter = order_count + 1
        while True:
            order_id = f"{short_code}O{next_counter:04d}"
            cursor.execute("SELECT id FROM orders WHERE order_id = %s", (order_id,))
            if not cursor.fetchone():
                break
            next_counter += 1

        total_price = 0
        for item in items:
            qty = int(item.get('quantity', 1))
            price = float(item.get('price', 0))
            if qty <= 0 or price < 0:
                return JsonResponse({'success': False, 'error': 'Invalid quantity or price.'}, status=400)
            total_price += qty * price

        now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
 
        # Get citizen name
        cursor.execute("SELECT name FROM users WHERE id = %s", (user_id,))
        cit_row = cursor.fetchone()
        customer_name = cit_row[0] if cit_row else "Online Customer"

        # Insert order record
        cursor.execute("""
            INSERT INTO orders (order_id, user_id, pharmacy_id, total_price, order_type, delivery_method, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, 'pending', %s)
        """, (order_id, user_id, pharmacy_id, total_price, order_type, delivery_method, now_str))

        # Insert bill record with bill_type = 'online'
        bill_date = datetime.date.today().strftime('%Y-%m-%d')
        cursor.execute("""
            INSERT INTO bills (pharmacy_id, user_id, customer_name, subtotal, sgst, cgst, discount, total_price, bill_type, payment_method, bill_date, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (pharmacy_id, user_id, customer_name, total_price, 0.0, 0.0, 0.0, total_price, 'online', 'Online Payment', bill_date, now_str))
        bill_id = cursor.lastrowid

        for item in items:
            medicine_id = int(item['medicine_id'])
            qty = int(item.get('quantity', 1))
            price = float(item.get('price', 0))
            
            # Insert into order_items
            cursor.execute("""
                INSERT INTO order_items (order_id, medicine_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (order_id, medicine_id, qty, price))
            
            # Insert into bill_items
            cursor.execute("""
                INSERT INTO bill_items (bill_id, medicine_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (bill_id, medicine_id, qty, price))

            # Deduct stock from pharmacy inventory
            cursor.execute("""
                UPDATE inventory
                SET stock = MAX(0, stock - %s)
                WHERE medicine_id = %s AND user_id = %s
            """, (qty, medicine_id, pharmacy_id))

        return JsonResponse({'success': True, 'message': 'Order placed successfully!', 'order_id': order_id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def user_orders(request):
    """List all orders for the logged-in user (citizen)."""
    if request.method != 'GET':
        return JsonResponse({'success': False, 'error': 'Only GET is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        from django.db import connection
        cursor = connection.cursor()
 
        cursor.execute("""
            SELECT o.order_id, o.total_price, o.order_type, o.delivery_method, o.status, o.created_at, 
                   u.name as pharmacy_name, u.address as pharmacy_address
            FROM orders o
            JOIN users u ON o.pharmacy_id = u.id
            WHERE o.user_id = %s
            ORDER BY o.id DESC
        """, (user_id,))
 
        orders = []
        for row in cursor.fetchall():
            order_id = row[0]
            cursor.execute("""
                SELECT oi.medicine_id, oi.quantity, oi.price, m.name, m.manufacturer, m.category, m.image_url
                FROM order_items oi
                JOIN medicines m ON oi.medicine_id = m.id
                WHERE oi.order_id = %s
            """, (order_id,))
            items = []
            for item_row in cursor.fetchall():
                items.append({
                    'medicine_id': item_row[0],
                    'quantity': item_row[1],
                    'price': item_row[2],
                    'medicine_name': item_row[3],
                    'manufacturer': item_row[4],
                    'category': item_row[5],
                    'image_url': item_row[6],
                })
            orders.append({
                'order_id': order_id,
                'total_price': row[1],
                'order_type': row[2],
                'delivery_method': row[3],
                'status': row[4],
                'created_at': row[5],
                'pharmacy_name': row[6],
                'pharmacy_address': row[7],
                'items': items,
            })
        return JsonResponse({'success': True, 'orders': orders})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def pharmacy_orders(request):
    """List all orders received by the logged-in pharmacy."""
    if request.method != 'GET':
        return JsonResponse({'success': False, 'error': 'Only GET is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        from django.db import connection
        cursor = connection.cursor()
 
        cursor.execute("""
            SELECT o.order_id, o.total_price, o.order_type, o.delivery_method, o.status, o.created_at,
                   u.name as customer_name, u.email as customer_email, u.mobile_number as customer_phone
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.pharmacy_id = %s
            ORDER BY o.id DESC
        """, (user_id,))
 
        orders = []
        for row in cursor.fetchall():
            order_id = row[0]
            cursor.execute("""
                SELECT oi.medicine_id, oi.quantity, oi.price, m.name, m.manufacturer, m.category
                FROM order_items oi
                JOIN medicines m ON oi.medicine_id = m.id
                WHERE oi.order_id = %s
            """, (order_id,))
            items = []
            for item_row in cursor.fetchall():
                items.append({
                    'medicine_id': item_row[0],
                    'quantity': item_row[1],
                    'price': item_row[2],
                    'medicine_name': item_row[3],
                    'manufacturer': item_row[4],
                    'category': item_row[5],
                })
            orders.append({
                'order_id': order_id,
                'total_price': row[1],
                'order_type': row[2],
                'delivery_method': row[3],
                'status': row[4],
                'created_at': row[5],
                'customer_name': row[6],
                'customer_email': row[7],
                'customer_phone': row[8],
                'items': items,
            })
        return JsonResponse({'success': True, 'orders': orders})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def update_order_status(request):
    """Pharmacy updates order status (confirmed, dispatched, delivered, cancelled)."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        data = json.loads(request.body)
        order_id = data.get('order_id')
        new_status = data.get('status')
 
        valid_statuses = ('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled')
        if new_status not in valid_statuses:
            return JsonResponse({'success': False, 'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}, status=400)
 
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE orders SET status = %s WHERE order_id = %s AND pharmacy_id = %s
        """, (new_status, order_id, user_id))
 
        if cursor.rowcount == 0:
            return JsonResponse({'success': False, 'error': 'Order not found or you do not have permission.'}, status=404)
 
        return JsonResponse({'success': True, 'message': f'Order status updated to {new_status}.'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def delete_order(request):
    """Delete an order and its items."""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST is allowed'}, status=405)
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    try:
        data = json.loads(request.body)
        order_id = data.get('order_id')
        if not order_id:
            return JsonResponse({'success': False, 'error': 'Missing order ID.'}, status=400)

        from django.db import connection
        cursor = connection.cursor()
        
        # Verify order belongs to the pharmacy
        cursor.execute("SELECT order_id FROM orders WHERE order_id = %s AND pharmacy_id = %s", (order_id, user_id))
        if not cursor.fetchone():
            return JsonResponse({'success': False, 'error': 'Order not found or unauthorized.'}, status=404)
            
        # Delete order items first
        cursor.execute("DELETE FROM order_items WHERE order_id = %s", (order_id,))
        # Delete order
        cursor.execute("DELETE FROM orders WHERE order_id = %s AND pharmacy_id = %s", (order_id, user_id))
        
        return JsonResponse({'success': True, 'message': 'Order deleted successfully!'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

from django.urls import path
from . import views

urlpatterns = [
    path('', views.pharmacy_dashboard, name='pharmacy_dashboard'),
    path('update-pharmacy-profile/', views.update_pharmacy_profile, name='update_pharmacy_profile'),
    path('inventory/list/', views.pharmacy_inventory_list, name='pharmacy_inventory_list'),
    path('inventory/add/', views.pharmacy_inventory_add, name='pharmacy_inventory_add'),
    path('inventory/edit/', views.pharmacy_inventory_edit, name='pharmacy_inventory_edit'),
    path('inventory/delete/', views.pharmacy_inventory_delete, name='pharmacy_inventory_delete'),
    path('bills/list/', views.list_bills, name='list_bills'),
    path('bills/add/', views.add_bill, name='add_bill'),
    path('bills/edit/', views.edit_bill, name='edit_bill'),
    path('bills/delete/', views.delete_bill, name='delete_bill'),
    path('citizens/list/', views.list_citizens, name='list_citizens'),
    # Orders
    path('orders/place/', views.place_order, name='place_order'),
    path('orders/user/', views.user_orders, name='user_orders'),
    path('orders/pharmacy/', views.pharmacy_orders, name='pharmacy_orders'),
    path('orders/update-status/', views.update_order_status, name='update_order_status'),
    path('orders/delete/', views.delete_order, name='delete_order'),
]

from django.urls import path
from . import views

urlpatterns = [
    path('send-otp/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('user-status/', views.user_status, name='user_status'),
    path('helpdesk/send/', views.helpdesk_send, name='helpdesk_send'),
    path('helpdesk/my-tickets/', views.helpdesk_my_tickets, name='helpdesk_my_tickets'),
    path('helpdesk/delete/', views.helpdesk_delete_ticket, name='helpdesk_delete_ticket'),
    path('public-stats/', views.public_stats, name='public_stats'),
    path('public-medicines/', views.public_medicines, name='public_medicines'),
    path('public-diseases/', views.public_diseases, name='public_diseases'),
    path('public-pharmacies/', views.public_pharmacies, name='public_pharmacies'),
    path('public-doctors/', views.public_doctors, name='public_doctors'),
    path('forgot-password/', views.forgot_password_request, name='forgot_password_request'),
    path('forgot-password/verify/', views.forgot_password_verify, name='forgot_password_verify'),
    path('forgot-password/reset/', views.forgot_password_reset, name='forgot_password_reset'),
]

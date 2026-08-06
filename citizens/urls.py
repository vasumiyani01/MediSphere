from django.urls import path
from . import views

urlpatterns = [
    path('', views.citizen_dashboard, name='citizen_dashboard'),
    path('update-citizen-profile/', views.update_citizen_profile, name='update_citizen_profile'),
    path('api/medicines/', views.public_medicines_list, name='public_medicines_list'),
    path('api/diseases/', views.public_diseases_list, name='public_diseases_list'),
    path('api/reports/templates/', views.public_report_templates, name='public_report_templates'),
    path('api/reports/list/', views.citizen_reports_list, name='citizen_reports_list'),
    path('api/reports/add/', views.citizen_report_add, name='citizen_report_add'),
    path('api/reports/edit/<int:report_id>/', views.citizen_report_edit, name='citizen_report_edit'),
    path('api/reports/delete/<int:report_id>/', views.citizen_report_delete, name='citizen_report_delete'),
    path('api/appointments/list/', views.citizen_appointments_list, name='citizen_appointments_list'),
    path('api/appointments/add/', views.citizen_appointment_add, name='citizen_appointment_add'),
    path('api/appointments/edit/<int:appointment_id>/', views.citizen_appointment_edit, name='citizen_appointment_edit'),
    path('api/appointments/delete/<int:appointment_id>/', views.citizen_appointment_delete, name='citizen_appointment_delete'),
    path('api/doctors/approved/', views.get_approved_doctors, name='get_approved_doctors'),
]

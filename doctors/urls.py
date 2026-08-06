from django.urls import path
from . import views

urlpatterns = [
    path('', views.doctor_dashboard, name='doctor_dashboard'),
    path('update-doctor-profile/', views.update_doctor_profile, name='update_doctor_profile'),
    path('api/appointments/list/', views.doctor_appointments_list, name='doctor_appointments_list'),
    path('api/appointments/complete/<int:appointment_id>/', views.complete_appointment, name='complete_appointment'),
    path('api/appointments/accept/<int:appointment_id>/', views.accept_appointment, name='accept_appointment'),
    path('api/appointment-slot/update/', views.update_appointment_slot, name='update_appointment_slot'),
]

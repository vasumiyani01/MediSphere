from django.urls import path
from . import views

urlpatterns = [
    path('', views.doctor_dashboard, name='doctor_dashboard'),
    path('update-doctor-profile/', views.update_doctor_profile, name='update_doctor_profile'),
]

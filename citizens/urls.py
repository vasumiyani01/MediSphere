from django.urls import path
from . import views

urlpatterns = [
    path('', views.citizen_dashboard, name='citizen_dashboard'),
    path('update-citizen-profile/', views.update_citizen_profile, name='update_citizen_profile'),
    path('api/medicines/', views.public_medicines_list, name='public_medicines_list'),
    path('api/diseases/', views.public_diseases_list, name='public_diseases_list'),
]

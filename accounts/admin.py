from django.contrib import admin
from .models import UserProfile

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'mobile_number', 'user_type', 'date_joined']
    search_fields = ['name', 'mobile_number', 'email']
    list_filter = ['user_type']

admin.site.register(UserProfile, UserProfileAdmin)

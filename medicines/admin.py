from django.contrib import admin
from .models import Medicine

class MedicineAdmin(admin.ModelAdmin):
    list_display = ['name', 'manufacturer', 'category', 'pack_size', 'image_url']
    search_fields = ['name', 'manufacturer']
    list_filter = ['category']

admin.site.register(Medicine, MedicineAdmin)

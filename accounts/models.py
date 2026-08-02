from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import datetime

class UserProfile(models.Model):
    USER_TYPE_CHOICES = [
        ('citizen', 'Citizen'),
        ('doctor', 'Doctor'),
        ('pharmacy', 'Pharmacy'),
        ('admin', 'Admin'),
    ]

    name = models.CharField(max_length=150)
    mobile_number = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='citizen')
    license_number = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=6, blank=True, null=True)
    open_from = models.CharField(max_length=5, blank=True, null=True)
    closes_from = models.CharField(max_length=5, blank=True, null=True)
    checkout_option = models.CharField(max_length=50, blank=True, null=True)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.user_type}"

class ActivityLog(models.Model):
    user_email = models.EmailField(blank=True, null=True)
    user_name = models.CharField(max_length=150, blank=True, null=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'

    def __str__(self):
        return f"{self.user_name or 'System'} ({self.user_email}) - {self.action} - {self.timestamp}"


class HelpdeskTicket(models.Model):
    sender_email = models.EmailField()
    sender_name = models.CharField(max_length=150)
    sender_type = models.CharField(max_length=20) # 'doctor', 'pharmacy'
    message = models.TextField()
    status = models.CharField(max_length=20, default='requested') # 'requested', 'open', 'resolved'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'helpdesk_tickets'

    def __str__(self):
        return f"Ticket from {self.sender_email} ({self.sender_type}) - Status: {self.status}"


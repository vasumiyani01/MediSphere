from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import datetime

class CustomUser(AbstractUser):
    mobile_number = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'mobile_number'
    REQUIRED_FIELDS = ['username', 'email']

    def __str__(self):
        return f"{self.username} ({self.mobile_number})"


class OTPVerification(models.Model):
    username = models.CharField(max_length=150)
    mobile_number = models.CharField(max_length=15)
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)

    def is_expired(self):
        # Valid for 5 minutes
        return timezone.now() > self.created_at + datetime.timedelta(minutes=5)

    def __str__(self):
        return f"{self.mobile_number} - {self.otp} - Verified: {self.verified}"


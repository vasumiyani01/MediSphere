from django.db import models
from accounts.models import UserProfile

class CitizenReport(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='reports')
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=50, default='Normal') # 'Normal', 'High', 'Low'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'citizen_reports'

    def __str__(self):
        return f"{self.name} ({self.user.name})"

class CitizenReportParameter(models.Model):
    report = models.ForeignKey(CitizenReport, on_delete=models.CASCADE, related_name='parameters')
    name = models.CharField(max_length=255)
    unit = models.CharField(max_length=100, blank=True, default='')
    value = models.CharField(max_length=100, blank=True, default='')
    min = models.CharField(max_length=50, blank=True, default='')
    max = models.CharField(max_length=50, blank=True, default='')
    status = models.CharField(max_length=50, default='Normal') # 'Normal', 'High', 'Low'

    class Meta:
        db_table = 'citizen_report_parameters'

    def __str__(self):
        return f"{self.name}: {self.value} {self.unit} ({self.status})"


class Appointment(models.Model):
    citizen = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='citizen_appointments')
    doctor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='doctor_appointments')
    reason = models.TextField()
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=50, default='Booked')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'appointments'

    def __str__(self):
        return f"{self.citizen.name} with Dr. {self.doctor.name} - {self.appointment_date}"

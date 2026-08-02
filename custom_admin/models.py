from django.db import models


class Report(models.Model):
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reports'

    def __str__(self):
        return self.name


class ReportParameter(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='parameters')
    parameter = models.CharField(max_length=255)
    unit = models.CharField(max_length=100, blank=True, default='')
    male_min = models.CharField(max_length=50, blank=True, default='')
    male_max = models.CharField(max_length=50, blank=True, default='')
    female_min = models.CharField(max_length=50, blank=True, default='')
    female_max = models.CharField(max_length=50, blank=True, default='')

    class Meta:
        db_table = 'report_parameters'

    def __str__(self):
        return f"{self.parameter} ({self.report.short_name})"

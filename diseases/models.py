from django.db import models

class Disease(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    causes = models.TextField(blank=True, null=True)
    symptoms = models.TextField(blank=True, null=True)
    risk_factors = models.TextField(blank=True, null=True)
    complications = models.TextField(blank=True, null=True)
    treatment = models.TextField(blank=True, null=True)
    medicine = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'diseases'

    def __str__(self):
        return self.name

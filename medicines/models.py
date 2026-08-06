from django.db import models

class Medicine(models.Model):
    CATEGORY_CHOICES = [
        ('tablet', 'Tablet'),
        ('capsule', 'Capsule'),
        ('syrup', 'Syrup'),
        ('drops', 'Drops'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=150)
    manufacturer = models.CharField(max_length=150)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='tablet')
    pack_size = models.CharField(max_length=100, default='10 Tablets')
    uses = models.TextField()
    side_effects = models.TextField()
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text="URL of the medicine image")
    
    class Meta:
        db_table = 'medicines'

    def __str__(self):
        return f"{self.name} ({self.manufacturer}) - {self.category}"

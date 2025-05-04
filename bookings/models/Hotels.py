###########################
##    IMPORTS SECTION    ##
###########################
# Python Libraries
import uuid
# Django Libraries
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


###########################
##     MODEL SECTION     ##
###########################
class Hotel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128, unique=True, db_column="name")
    address = models.CharField(max_length=512, db_column="address")
    rating = models.DecimalField(
        max_digits=2, decimal_places=1,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        default=0.0,
        help_text="Hotel rating between 0.0 and 5.0"
    )

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['rating'])
        ]

    def __str__(self):
        return self.name


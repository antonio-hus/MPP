###########################
##    IMPORTS SECTION    ##
###########################
# Python Libraries
import uuid
# Django Libraries
from django.db import models
from django.core.validators import MinValueValidator
# Project Libraries
from .Hotels import Hotel


###########################
##     MODEL SECTION     ##
###########################
class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    number = models.PositiveIntegerField(db_column="number")
    capacity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        db_column="capacity"
    )
    price_per_night = models.DecimalField(
        max_digits=8, decimal_places=2,
        validators=[MinValueValidator(0.00)],
        default=0.00
    )
    hotel = models.ForeignKey(to=Hotel, on_delete=models.CASCADE, related_name='rooms')

    class Meta:
        unique_together = ('number', 'hotel')
        ordering = ['number']
        indexes = [
            models.Index(fields=['hotel', 'price_per_night'])
        ]

    def __str__(self):
        return f"Room {self.number} - {self.hotel.name}"

###########################
##    IMPORTS SECTION    ##
###########################
# Python Libraries
import uuid
# Django Libraries
from django.db import models


###########################
##     MODEL SECTION     ##
###########################
class Booking(models.Model):
    """Represents bookings that affect available slots."""
    class BookingState(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_name = models.CharField(max_length=127)
    customer_email = models.CharField(max_length=127)
    customer_phone = models.CharField(max_length=20)
    datetime = models.DateTimeField()
    state = models.CharField(
        max_length=10,
        choices=BookingState.choices,
        default=BookingState.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
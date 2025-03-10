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
    customerName = models.CharField(max_length=127, db_column="customer_name")
    customerEmail = models.CharField(max_length=127, db_column="customer_email")
    customerPhone = models.CharField(max_length=20, db_column="customer_phone")
    startDate = models.DateField(db_column="start_date")
    endDate = models.DateField(db_column="end_date")
    state = models.CharField(
        max_length=10,
        choices=BookingState.choices,
        default=BookingState.PENDING
    )
    createdAt = models.DateTimeField(auto_now_add=True, db_column="created_at")
    completedAt = models.DateTimeField(null=True, blank=True, db_column="completed_at")

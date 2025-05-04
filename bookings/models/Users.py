###########################
##    IMPORTS SECTION    ##
###########################
# Python Libraries
import uuid
# Django Libraries
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser


###########################
##     MODEL SECTION     ##
###########################
class BookingUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'Regular User'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    def is_admin(self):
        return self.role == 'admin'


class MonitoredUser(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='monitor_entry'
    )
    flagged_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} flagged at {self.flagged_at}"

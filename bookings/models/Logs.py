###########################
##    IMPORTS SECTION    ##
###########################
# Django Libraries
from django.conf import settings
from django.db import models


###########################
##     MODEL SECTION     ##
###########################
class OperationLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('RETRIEVE', 'Retrieve'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LIST', 'List'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='operation_logs'
    )
    model = models.CharField(max_length=50)
    object_id = models.CharField(max_length=100, blank=True, null=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} {self.action} {self.model}({self.object_id}) at {self.timestamp}"

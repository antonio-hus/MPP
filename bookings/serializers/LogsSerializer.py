###################
# IMPORTS SECTION #
###################
# Django Rest Framework Libraries
from rest_framework import serializers
# Project Libraries
from bookings.models import OperationLog


#######################
# SERIALIZERS SECTION #
#######################
class OperationLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = OperationLog
        fields = ('id', 'username', 'model', 'object_id', 'action', 'timestamp')
        read_only_fields = fields

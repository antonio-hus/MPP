###################
# IMPORTS SECTION #
###################
from rest_framework import serializers
from bookings.models import Room, Hotel


#######################
# SERIALIZERS SECTION #
#######################
class RoomSerializer(serializers.ModelSerializer):
    hotel = serializers.PrimaryKeyRelatedField(queryset=Hotel.objects.all())

    class Meta:
        model = Room
        fields = ['id', 'number', 'capacity', 'price_per_night', 'hotel']


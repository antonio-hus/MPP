###################
# IMPORTS SECTION #
###################
from rest_framework import serializers
from bookings.models import Hotel


#######################
# SERIALIZERS SECTION #
#######################
class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ['id', 'name', 'address', 'rating']


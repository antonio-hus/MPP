###################
# IMPORTS SECTION #
###################
from rest_framework import serializers
from bookings.models import Booking


#######################
# SERIALIZERS SECTION #
#######################
class BookingSerializer(serializers.ModelSerializer):
    customerEmail = serializers.EmailField()

    class Meta:
        model = Booking
        fields = '__all__'

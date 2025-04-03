###################
# IMPORTS SECTION #
###################
import random
import threading
import time
from django.apps import AppConfig
from django.conf import settings
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


##############################
# APP CONFIGURATIONS SECTION #
##############################
class BookingsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "bookings"

    def ready(self):
        from bookings.models import Booking

        # Delete all bookings with auto-generated email
        deleted_count, _ = Booking.objects.filter(customerEmail="auto@example.com").delete()
        print(f"Cleaned up {deleted_count} auto-generated bookings")

        # Check if we want a background websocket running
        if settings.WS_FLAG:

            # Start the background thread when the app is ready.
            thread = threading.Thread(target=self.generate_bookings, daemon=True)
            thread.start()

    def generate_bookings(self):
        from bookings.models import Booking
        from bookings.serializers import BookingSerializer

        channel_layer = get_channel_layer()
        index = 1
        statuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'CONFIRMED']
        while True:
            # Wait for a while before generating a new booking.
            time.sleep(2)
            print("Added Value")

            # Create a new booking (or simulate one)
            new_booking = Booking.objects.create(
                customerName=f"Auto Generated{index}",
                customerEmail="auto@example.com",
                customerPhone="1234567890",
                startDate="2025-04-02",
                endDate="2025-04-03",
                state=random.choice(statuses),
            )
            serializer = BookingSerializer(new_booking)
            data = {"new_booking": serializer.data}

            index += 1

            # Broadcast the new booking data to the group.
            async_to_sync(channel_layer.group_send)(
                "booking_updates",
                {"type": "booking_update", "data": data},
            )

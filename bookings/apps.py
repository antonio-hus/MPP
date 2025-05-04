###################
# IMPORTS SECTION #
###################
# Python Libraries
import sys
import random
import threading
import time
# Django Libraries
from django.apps import AppConfig
from django.conf import settings
from asgiref.sync import async_to_sync
# Third Party Libraries
from channels.layers import get_channel_layer
from django.db.models import Count
from django.utils import timezone


##############################
# APP CONFIGURATIONS SECTION #
##############################
class BookingsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "bookings"

    def ready(self):

        # Delete all bookings with auto-generated email
        # from bookings.models import Booking
        # deleted_count, _ = Booking.objects.filter(customerEmail="auto@example.com").delete()
        # print(f"Cleaned up {deleted_count} auto-generated bookings")

        # Start thread only on runserver command
        if any(cmd in sys.argv for cmd in ('makemigrations', 'migrate', 'collectstatic', 'test')):
            return

        # Start monitor thread when the app is ready
        monitor_thread = threading.Thread(target=self.monitor_loop, daemon=True)
        monitor_thread.start()

        # Check if we want a background websocket running
        if settings.WS_FLAG:

            # Start websocket thread when the app is ready.
            websocket_thread = threading.Thread(target=self.generate_bookings, daemon=True)
            websocket_thread.start()

    def monitor_loop(self):
        from .models import OperationLog, MonitoredUser
        interval = getattr(settings, 'MONITOR_SCAN_INTERVAL', 60)
        window = getattr(settings, 'MONITOR_WINDOW_SIZE', 60)
        thresh = getattr(settings, 'MONITOR_THRESHOLD', 20)

        while True:
            now = timezone.now()
            window_start = now - timezone.timedelta(seconds=window)

            # Aggregate operations per user in the window
            qs = (OperationLog.objects
                  .filter(timestamp__gte=window_start)
                  .values('user')
                  .annotate(op_count=Count('id'))
                  .filter(op_count__gt=thresh))

            for entry in qs:
                user_id = entry['user']

                # If not already flagged, create an entry
                MonitoredUser.objects.get_or_create(user_id=user_id)
                print("We have a suspicious user: ", user_id)

            time.sleep(interval)

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

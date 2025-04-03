from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from bookings.consumer import BookingConsumer

websocket_urlpatterns = [
    path("ws/bookings/", BookingConsumer.as_asgi()),
]

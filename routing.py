from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from bookings.consumer import BookingConsumer

application = ProtocolTypeRouter({
    "websocket": URLRouter([
        path("ws/bookings/", BookingConsumer.as_asgi()),
    ]),
})

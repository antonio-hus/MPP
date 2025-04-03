###################
# IMPORTS SECTION #
###################
import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import bookings.routing

##############################
# ASGI CONFIGURATION SECTION #
##############################
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "MPP.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            bookings.routing.websocket_urlpatterns
        )
    ),
})
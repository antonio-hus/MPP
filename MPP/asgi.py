###################
# IMPORTS SECTION #
###################
import os
from django.core.asgi import get_asgi_application


##############################
# ASGI CONFIGURATION SECTION #
##############################
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "MPP.settings")
application = get_asgi_application()

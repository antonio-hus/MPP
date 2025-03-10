###################
# IMPORTS SECTION #
###################
import os
from django.core.wsgi import get_wsgi_application


##############################
# WSGI CONFIGURATION SECTION #
##############################
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "MPP.settings")
application = get_wsgi_application()

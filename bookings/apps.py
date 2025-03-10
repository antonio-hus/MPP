###################
# IMPORTS SECTION #
###################
from django.apps import AppConfig


##############################
# APP CONFIGURATIONS SECTION #
##############################
class BookingsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "bookings"

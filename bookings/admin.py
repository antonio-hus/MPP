###################
# IMPORTS SECTION #
###################
from django.contrib import admin
from bookings.models import Booking


#####################################
# ADMIN PANEL CONFIGURATION SECTION #
#####################################
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'customerName', 'customerEmail', 'startDate', 'endDate', 'state', 'createdAt')
    search_fields = ('customerName', 'customerEmail')

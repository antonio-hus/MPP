###################
# IMPORTS SECTION #
###################
from django.contrib import admin
from django.urls import path, include


########################
# URL PATTERNS SECTION #
########################
urlpatterns = [

    # Admin Panel
    path("admin/", admin.site.urls),

    # Bookings App
    path("", include("bookings.urls"))
]

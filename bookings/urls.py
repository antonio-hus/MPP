###################
# IMPORTS SECTION #
###################
from django.urls import path
from . import views


########################
# URL PATTERNS SECTION #
########################
urlpatterns = [
    path('bookings/', views.booking_list, name='booking_list'),
    path('bookings/<uuid:pk>/', views.booking_detail, name='booking_detail'),
]


###################
# IMPORTS SECTION #
###################
from django.urls import path
from . import views


########################
# URL PATTERNS SECTION #
########################
urlpatterns = [

    # Bookings related URL Paths
    path('bookings/', views.booking_list, name='booking_list'),
    path('bookings/<uuid:pk>/', views.booking_detail, name='booking_detail'),

    # Files related URL Paths
    path('upload/<str:filename>/', views.upload_file, name='file_upload'),
    path('download/<str:filename>/', views.download_file, name='file_download'),
]


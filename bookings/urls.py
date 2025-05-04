###################
# IMPORTS SECTION #
###################
from django.urls import path
from . import views


########################
# URL PATTERNS SECTION #
########################
urlpatterns = [

    # Authentication related URL Paths
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),

    # Admin related URL Paths
    path('monitored-users/', views.monitored_users_list, name='monitored_users'),
    path('operation-logs/', views.operation_logs_list, name='operation_logs'),

    # Bookings related URL Paths
    path('bookings/', views.booking_list, name='booking_list'),
    path('bookings/<uuid:pk>/', views.booking_detail, name='booking_detail'),

    # Hotels related URL Paths
    path('hotels/', views.hotel_list, name='hotel_list'),
    path('hotels/<uuid:pk>/', views.hotel_detail, name='hotel_detail'),

    # Rooms related URL Paths
    path('rooms/', views.room_list, name='room_list'),
    path('rooms/<uuid:pk>/', views.room_detail, name='room_detail'),

    # Files related URL Paths
    path('files/', views.list_files, name='list_files'),
    path('upload/<str:filename>/', views.upload_file, name='file_upload'),
    path('download/<str:filename>/', views.download_file, name='file_download'),

    # Tests related URL Paths
    path('loadtest/high_end_hotels_stats_view', views.high_end_hotels_stats_view, name='high_end_hotels_stats_view')
]


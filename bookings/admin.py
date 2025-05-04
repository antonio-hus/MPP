###################
# IMPORTS SECTION #
###################
# Django Libraries
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
# Project Libraries
from .models import (
    Booking,
    Hotel,
    Room,
    OperationLog,
    MonitoredUser,
)


#####################################
# ADMIN PANEL CONFIGURATION SECTION #
#####################################

BookingUser = get_user_model()


@admin.register(BookingUser)
class BookingUserAdmin(DjangoUserAdmin):
    list_display = (
        'username', 'email', 'first_name', 'last_name',
        'role', 'is_staff', 'is_active',
    )
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = (
        (None,               {'fields': ('username', 'password')}),
        ('Personal info',    {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions',      {
            'fields': (
                'role',
                'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions',
            )
        }),
        ('Important dates',  {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'role', 'password1', 'password2'),
        }),
    )
    search_fields = ('username', 'email')
    ordering = ('username',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'customerName', 'customerEmail', 'customerPhone',
        'startDate', 'endDate', 'state', 'createdAt', 'completedAt',
    )
    list_filter = ('state', 'startDate', 'endDate')
    search_fields = ('customerName', 'customerEmail', 'customerPhone')
    date_hierarchy = 'createdAt'


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'rating', 'address')
    list_filter = ('rating',)
    search_fields = ('name', 'address')


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'number', 'hotel', 'capacity', 'price_per_night')
    list_filter = ('hotel',)
    search_fields = ('number',)
    raw_id_fields = ('hotel',)


@admin.register(OperationLog)
class OperationLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'model', 'object_id', 'action', 'timestamp')
    list_filter = ('action', 'model', 'timestamp')
    search_fields = ('user__username', 'model', 'object_id')
    readonly_fields = ('user', 'model', 'object_id', 'action', 'timestamp')


@admin.register(MonitoredUser)
class MonitoredUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'flagged_at')
    search_fields = ('user__username',)
    readonly_fields = ('user', 'flagged_at')
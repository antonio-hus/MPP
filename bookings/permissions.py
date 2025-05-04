###################
# IMPORTS SECTION #
###################
# Django Rest Framework
from rest_framework import permissions
from rest_framework.permissions import BasePermission, IsAuthenticated


#######################
# PERMISSIONS SECTION #
#######################
class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to our BookingUser with role='admin'.
    """

    def has_permission(self, request, view):
        return (
            bool(request.user and request.user.is_authenticated)
            and getattr(request.user, 'role', '') == 'admin'
        )


class IsAuthenticatedExceptHead(BasePermission):
    """
    Allow HEAD requests from anyone, require authentication for others.
    """
    def has_permission(self, request, view):
        if request.method == 'HEAD':
            return True
        return request.user and request.user.is_authenticated
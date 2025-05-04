###################
# IMPORTS SECTION #
###################
# Django Rest Framework Libraries
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
# Project Libraries
from bookings.serializers import RegisterSerializer, LoginSerializer
from bookings.serializers.LogsSerializer import OperationLogSerializer
from bookings.serializers.UsersSerializer import MonitoredUserSerializer
from bookings.models import MonitoredUser, OperationLog
from bookings.permissions import IsAdminUserRole


#################
# VIEWS SECTION #
#################
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'userRole': user.role
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'userRole': user.role
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAdminUserRole])
def monitored_users_list(request):
    """
    Returns all flagged users. Only for admins.
    """

    qs = MonitoredUser.objects.select_related('user').all()
    serializer = MonitoredUserSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUserRole])
def operation_logs_list(request):
    """
    Returns all OperationLog entries. Only for admins.
    """
    qs = OperationLog.objects.select_related('user').order_by('-timestamp')
    serializer = OperationLogSerializer(qs, many=True)
    return Response(serializer.data)
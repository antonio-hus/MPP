###################
# IMPORTS SECTION #
###################
# Django Libraries
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings
from django.contrib.auth import get_user_model
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
        try:
            if serializer.is_valid():
                user = serializer.save()
                user.is_active = False
                user.save()

                token = default_token_generator.make_token(user)
                verification_url = request.build_absolute_uri(
                   settings.FRONTEND_URL + f'auth/verify-email?uid={user.pk}&token={token}'
                )

                try:
                    send_mail(
                        subject='Verify your email',
                        message=f'Click the link to verify your email: {verification_url}',
                        from_email=f'UBB-MPP <{settings.EMAIL_HOST_USER}>',
                        recipient_list=[user.email],
                        fail_silently=False
                    )
                except Exception as email_error:
                    print(f"Email error: {email_error}")
                    return Response({
                        'detail': 'User registered but email verification failed. Please contact support.',
                        'error': str(email_error)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                return Response({'detail': 'Verification email sent'}, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Registration error: {e}")
            return Response({
                'error': 'Server error during registration',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request):

    User = get_user_model()
    uid = request.GET.get('uid')
    token = request.GET.get('token')

    try:
        user = User.objects.get(pk=uid)
    except User.DoesNotExist:
        return Response({'error': 'Invalid user'}, status=status.HTTP_400_BAD_REQUEST)

    if default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({'detail': 'Email verified successfully!'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)


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
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)



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
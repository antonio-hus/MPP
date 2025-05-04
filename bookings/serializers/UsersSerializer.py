###################
# IMPORTS SECTION #
###################
# Django Libraries
from django.contrib.auth import authenticate
# Django Rest Framework Libraries
from rest_framework import serializers
# Project Libraries
from bookings.models import BookingUser, MonitoredUser


#######################
# SERIALIZERS SECTION #
#######################
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingUser
        fields = ('username', 'email', 'password', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = BookingUser.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        return user


class MonitoredUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    flagged_at = serializers.DateTimeField()

    class Meta:
        model = MonitoredUser
        fields = ('user', 'username', 'flagged_at')
        read_only_fields = fields

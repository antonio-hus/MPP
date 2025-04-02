###################
# IMPORTS SECTION #
###################
from datetime import date, datetime, timedelta
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework import status
from bookings.models import Booking
from bookings.views import booking_list, booking_detail
from bookings.serializers import BookingSerializer


#################
# TESTS SECTION #
#################
class TestBookingView(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.booking = Booking.objects.create(
            customerName="Ion Popescu",
            customerEmail="ion@popescu.ro",
            customerPhone="0722333444",
            startDate=date.today() + timedelta(days=10),
            endDate=date.today() + timedelta(days=15),
            state="CONFIRMED",
            createdAt=datetime.now(),
            completedAt=datetime.now()
        )
        self.now_iso = datetime.now().isoformat()

    def test_booking_list_get_all(self):
        request = self.factory.get('/bookings/')
        response = booking_list(request)
        serializer = BookingSerializer(Booking.objects.all(), many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_list_filter_by_id(self):
        request = self.factory.get('/bookings/', {'id': str(self.booking.id)})
        response = booking_list(request)
        qs = Booking.objects.filter(id=self.booking.id)
        serializer = BookingSerializer(qs, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_list_filter_by_name(self):
        request = self.factory.get('/bookings/', {'name': 'ion'})
        response = booking_list(request)
        qs = Booking.objects.filter(customerName__icontains="ion")
        serializer = BookingSerializer(qs, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_list_filter_by_email(self):
        request = self.factory.get('/bookings/', {'email': 'popescu'})
        response = booking_list(request)
        qs = Booking.objects.filter(customerEmail__icontains="popescu")
        serializer = BookingSerializer(qs, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_list_filter_by_phone(self):
        request = self.factory.get('/bookings/', {'phone': '0722'})
        response = booking_list(request)
        qs = Booking.objects.filter(customerPhone__icontains="0722")
        serializer = BookingSerializer(qs, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_list_filter_by_start_date(self):
        start_date = (date.today() + timedelta(days=5)).isoformat()
        request = self.factory.get('/bookings/', {'start_date': start_date})
        response = booking_list(request)
        qs = Booking.objects.filter(startDate__gte=start_date)
        serializer = BookingSerializer(qs, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_list_filter_by_end_date(self):
        end_date = (date.today() + timedelta(days=20)).isoformat()
        request = self.factory.get('/bookings/', {'end_date': end_date})
        response = booking_list(request)
        qs = Booking.objects.filter(endDate__lte=end_date)
        serializer = BookingSerializer(qs, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_list_filter_by_state(self):
        request = self.factory.get('/bookings/', {'state': 'CONFIRMED'})
        response = booking_list(request)
        qs = Booking.objects.filter(state="CONFIRMED")
        serializer = BookingSerializer(qs, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_list_filter_by_createdAt(self):
        created_at = self.booking.createdAt.isoformat()
        request = self.factory.get('/bookings/', {'created_at': created_at})
        response = booking_list(request)
        qs = Booking.objects.filter(createdAt=created_at)
        serializer = BookingSerializer(qs, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_list_filter_by_completedAt(self):
        completed_at = self.booking.completedAt.isoformat()
        request = self.factory.get('/bookings/', {'completed_at': completed_at})
        response = booking_list(request)
        qs = Booking.objects.filter(completedAt=completed_at)
        serializer = BookingSerializer(qs, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_list_ordering(self):
        Booking.objects.create(
            customerName="Maria Ionescu",
            customerEmail="maria@ionescu.ro",
            customerPhone="0733445566",
            startDate=date.today() + timedelta(days=20),
            endDate=date.today() + timedelta(days=25),
            state="PENDING",
            createdAt=datetime.now(),
            completedAt=datetime.now()
        )
        request = self.factory.get('/bookings/', {'ordering': 'customerName'})
        response = booking_list(request)
        qs = Booking.objects.all().order_by("customerName")
        serializer = BookingSerializer(qs, many=True)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_list_post_valid_data(self):
        data = {
            "customerName": "Ana Iacob",
            "customerEmail": "ana@iacob.ro",
            "customerPhone": "0744556677",
            "startDate": (date.today() + timedelta(days=30)).isoformat(),
            "endDate": (date.today() + timedelta(days=35)).isoformat(),
            "state": "PENDING",
            "createdAt": self.now_iso,
            "completedAt": self.now_iso
        }
        request = self.factory.post('/bookings/', data, format='json')
        response = booking_list(request)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Booking.objects.filter(customerEmail="ana@iacob.ro").exists())

    def test_booking_list_post_invalid_data(self):
        data = {
            "customerEmail": "ana@iacob.ro",
            "customerPhone": "0744556677",
            "startDate": (date.today() + timedelta(days=30)).isoformat(),
            "endDate": (date.today() + timedelta(days=35)).isoformat(),
            "state": "PENDING",
            "createdAt": self.now_iso,
            "completedAt": self.now_iso
        }
        request = self.factory.post('/bookings/', data, format='json')
        response = booking_list(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_booking_detail_get_valid(self):
        request = self.factory.get('/bookings/{}/'.format(self.booking.pk))
        response = booking_detail(request, pk=self.booking.pk)
        serializer = BookingSerializer(self.booking)
        self.assertEqual(response.data, serializer.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_booking_detail_get_invalid(self):
        request = self.factory.get('/bookings/9999/')
        response = booking_detail(request, pk=9999)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_booking_detail_put_valid(self):
        updated_data = {
            "customerName": "Ionel Popa",
            "customerEmail": "ionel@popa.ro",
            "customerPhone": "0755667788",
            "startDate": (date.today() + timedelta(days=12)).isoformat(),
            "endDate": (date.today() + timedelta(days=18)).isoformat(),
            "state": "CONFIRMED",
            "createdAt": self.booking.createdAt.isoformat(),
            "completedAt": self.booking.completedAt.isoformat()
        }
        request = self.factory.put('/bookings/{}/'.format(self.booking.pk), updated_data, format='json')
        response = booking_detail(request, pk=self.booking.pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.customerName, "Ionel Popa")
        self.assertEqual(self.booking.customerEmail, "ionel@popa.ro")

    def test_booking_detail_put_invalid(self):
        updated_data = {
            "customerName": "",
            "customerEmail": "ionel@popa.ro",
            "customerPhone": "0755667788",
            "startDate": (date.today() + timedelta(days=12)).isoformat(),
            "endDate": (date.today() + timedelta(days=18)).isoformat(),
            "state": "CONFIRMED",
            "createdAt": self.booking.createdAt.isoformat(),
            "completedAt": self.booking.completedAt.isoformat()
        }
        request = self.factory.put('/bookings/{}/'.format(self.booking.pk), updated_data, format='json')
        response = booking_detail(request, pk=self.booking.pk)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_booking_detail_patch_valid(self):
        partial_data = {"customerName": "Ion Updated"}
        request = self.factory.patch('/bookings/{}/'.format(self.booking.pk), partial_data, format='json')
        response = booking_detail(request, pk=self.booking.pk)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.customerName, "Ion Updated")

    def test_booking_detail_patch_invalid(self):
        partial_data = {"customerEmail": "not-an-email"}
        request = self.factory.patch('/bookings/{}/'.format(self.booking.pk), partial_data, format='json')
        response = booking_detail(request, pk=self.booking.pk)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_booking_detail_delete(self):
        request = self.factory.delete('/bookings/{}/'.format(self.booking.pk))
        response = booking_detail(request, pk=self.booking.pk)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Booking.objects.filter(pk=self.booking.pk).exists())
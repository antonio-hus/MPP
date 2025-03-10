###################
# IMPORTS SECTION #
###################
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from bookings.models import Booking
from bookings.serializers import BookingSerializer


#################
# VIEWS SECTION #
#################
@api_view(['GET', 'POST'])
def booking_list(request):
    """
    List all bookings or create a new booking.
    Supports filtering via query parameters:
      - name: search in customer_name (case-insensitive partial match)
      - email: search in customer_email (case-insensitive partial match)
      - phone: search in customer_phone (case-insensitive partial match)
      - start_date: return bookings starting on or after this date (YYYY-MM-DD)
      - end_date: return bookings ending on or before this date (YYYY-MM-DD)
      - state: exact match for booking state (e.g., PENDING, CONFIRMED)
    """
    if request.method == 'GET':
        bookings = Booking.objects.all()

        # Retrieve query parameters
        name_query = request.GET.get("name", "")
        email_query = request.GET.get("email", "")
        phone_query = request.GET.get("phone", "")
        start_date_query = request.GET.get("start_date", "")
        end_date_query = request.GET.get("end_date", "")
        state_query = request.GET.get("state", "")

        if name_query:
            bookings = bookings.filter(customerName__icontains=name_query)
        if email_query:
            bookings = bookings.filter(customerEmail__icontains=email_query)
        if phone_query:
            bookings = bookings.filter(customerPhone__icontains=phone_query)
        if start_date_query:
            bookings = bookings.filter(startDate__gte=start_date_query)
        if end_date_query:
            bookings = bookings.filter(endDate__lte=end_date_query)
        if state_query:
            bookings = bookings.filter(state=state_query)

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def booking_detail(request, pk):
    """
    Retrieve, update or delete a booking by its primary key.
    """
    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = BookingSerializer(booking)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = BookingSerializer(booking, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

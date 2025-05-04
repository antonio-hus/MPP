###################
# IMPORTS SECTION #
###################
# Django Rest Framework Libraries
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
# Project Libraries
from bookings.models import Booking
from bookings.permissions import IsAuthenticatedExceptHead, IsAuthenticated
from bookings.serializers import BookingSerializer
from bookings.utils import log_crud


#################
# VIEWS SECTION #
#################
@api_view(['GET', 'POST', 'HEAD'])
@permission_classes([IsAuthenticatedExceptHead])
@log_crud('Booking')
def booking_list(request):
    """
    List all bookings or create a new booking.
    Supports filtering via query parameters for every field...
    Supports sorting via the "ordering" query parameter.
    Also supports pagination via "limit" and "offset" query parameters.
    """
    if request.method == 'HEAD':
        return Response(status=status.HTTP_200_OK)

    if request.method == 'GET':
        bookings = Booking.objects.all()

        # Filtering by all fields:
        id_query = request.GET.get("id", "")
        if id_query:
            bookings = bookings.filter(id=id_query)

        name_query = request.GET.get("name", "")
        if name_query:
            bookings = bookings.filter(customerName__icontains=name_query)

        email_query = request.GET.get("email", "")
        if email_query:
            bookings = bookings.filter(customerEmail__icontains=email_query)

        phone_query = request.GET.get("phone", "")
        if phone_query:
            bookings = bookings.filter(customerPhone__icontains=phone_query)

        start_date_query = request.GET.get("start_date", "")
        if start_date_query:
            bookings = bookings.filter(startDate__gte=start_date_query)

        end_date_query = request.GET.get("end_date", "")
        if end_date_query:
            bookings = bookings.filter(endDate__lte=end_date_query)

        state_query = request.GET.get("state", "")
        if state_query:
            bookings = bookings.filter(state=state_query)

        created_at_query = request.GET.get("created_at", "")
        if created_at_query:
            bookings = bookings.filter(createdAt=created_at_query)

        completed_at_query = request.GET.get("completed_at", "")
        if completed_at_query:
            bookings = bookings.filter(completedAt=completed_at_query)

        # Sorting:
        ordering = request.GET.get("ordering", "")
        if ordering:
            bookings = bookings.order_by(ordering)

        # Pagination: read limit and offset, with sensible defaults
        try:
            limit = int(request.GET.get("limit", 10))
            offset = int(request.GET.get("offset", 0))
        except ValueError:
            return Response({"error": "limit and offset must be integers"},
                            status=status.HTTP_400_BAD_REQUEST)

        total = bookings.count()
        bookings = bookings[offset:offset + limit]

        serializer = BookingSerializer(bookings, many=True)
        return Response({
            "count": total,
            "results": serializer.data,
            "next_offset": offset + limit if offset + limit < total else None,
        })

    elif request.method == 'POST':
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@log_crud('Booking')
def booking_detail(request, pk):
    """
    Retrieve, update (PUT or PATCH) or delete a booking by its primary key.
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

    elif request.method == 'PATCH':
        serializer = BookingSerializer(booking, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
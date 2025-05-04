###################
# IMPORTS SECTION #
###################
# Django Rest Framework Libraries
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
# Project Libraries
from bookings.models import Room
from bookings.serializers import RoomSerializer
from bookings.utils import log_crud


#################
# VIEWS SECTION #
#################
@api_view(['GET', 'POST', 'HEAD'])
@permission_classes([IsAuthenticated])
@log_crud('Room')
def room_list(request):
    """
    List all rooms or create a new room.
    """
    if request.method == 'HEAD':
        return Response(status=status.HTTP_200_OK)

    if request.method == 'GET':

        # Select Related Optimization
        qs = Room.objects.select_related('hotel').all()

        # Exact room number filter
        number = request.GET.get('number')
        if number is not None:
            try:
                qs = qs.filter(number=int(number))
            except ValueError:
                return Response(
                    {'error': 'number must be an integer'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Hotel filter (as before)
        hotel_id = request.GET.get('hotel')
        if hotel_id:
            qs = qs.filter(hotel__id=hotel_id)

        # Min capacity
        min_cap = request.GET.get('min_capacity')
        if min_cap is not None:
            try:
                qs = qs.filter(capacity__gte=int(min_cap))
            except ValueError:
                return Response(
                    {'error': 'min_capacity must be an integer'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Max price per night
        max_price = request.GET.get('max_price')
        if max_price is not None:
            try:
                qs = qs.filter(price_per_night__lte=float(max_price))
            except ValueError:
                return Response(
                    {'error': 'max_price must be a number'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Ordering
        ordering = request.GET.get('ordering')
        if ordering:
            qs = qs.order_by(ordering)

        # Pagination
        try:
            limit = int(request.GET.get('limit', 10))
            offset = int(request.GET.get('offset', 0))
        except ValueError:
            return Response(
                {'error': 'limit and offset must be integers'},
                status=status.HTTP_400_BAD_REQUEST
            )

        total = qs.count()
        slice_qs = qs[offset:offset + limit]
        serializer = RoomSerializer(slice_qs, many=True)

        return Response({
            'count': total,
            'results': serializer.data,
            'next_offset': offset + limit if offset + limit < total else None
        })

    # POST
    serializer = RoomSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@log_crud('Room')
def room_detail(request, pk):
    """
    Retrieve, update, or delete a room by its primary key.
    """
    try:

        # Query optimization - prefetching the hotel too
        room = Room.objects.select_related('hotel').get(pk=pk)
    except Room.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = RoomSerializer(room)
        return Response(serializer.data)

    if request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = RoomSerializer(room, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        room.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

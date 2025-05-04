###################
# IMPORTS SECTION #
###################
# Django Rest Framework Libraries
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
# Project Libraries
from bookings.models import Hotel
from bookings.serializers import HotelSerializer
from bookings.utils import log_crud


#################
# VIEWS SECTION #
#################
@api_view(['GET', 'POST', 'HEAD'])
@permission_classes([IsAuthenticated])
@log_crud('Hotel')
def hotel_list(request):
    """
    List all hotels or create a new hotel.
    """
    if request.method == 'HEAD':
        return Response(status=status.HTTP_200_OK)

    if request.method == 'GET':
        hotels = Hotel.objects.all()

        # Optional filtering by name or rating
        name = request.GET.get('name')
        if name:
            hotels = hotels.filter(name__icontains=name)

        min_rating = request.GET.get('min_rating')
        if min_rating:
            hotels = hotels.filter(rating__gte=min_rating)

        # Sorting
        ordering = request.GET.get('ordering')
        if ordering:
            hotels = hotels.order_by(ordering)

        # Pagination
        try:
            limit = int(request.GET.get('limit', 10))
            offset = int(request.GET.get('offset', 0))
        except ValueError:
            return Response({'error': 'limit and offset must be integers'}, status=status.HTTP_400_BAD_REQUEST)

        total = hotels.count()
        hotels = hotels[offset:offset + limit]
        serializer = HotelSerializer(hotels, many=True)
        return Response({'count': total, 'results': serializer.data,
                         'next_offset': offset + limit if offset + limit < total else None})

    # POST
    serializer = HotelSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@log_crud('Hotel')
def hotel_detail(request, pk):
    """
    Retrieve, update, or delete a hotel by its primary key.
    """
    try:
        hotel = Hotel.objects.get(pk=pk)
    except Hotel.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = HotelSerializer(hotel)
        return Response(serializer.data)

    if request.method in ['PUT', 'PATCH']:
        partial = (request.method == 'PATCH')
        serializer = HotelSerializer(hotel, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        hotel.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
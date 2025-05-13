###################
# IMPORTS SECTION #
###################
# Django Libraries
from django.db.models import Sum, Avg, Count, Min, Max
# Django Rest Framework Libraries
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
# Project Libraries
from bookings.models import Hotel, Room


#################
# VIEWS SECTION #
#################
@api_view(['GET'])
@permission_classes([AllowAny])
def high_end_hotels_stats_view(request):
    """
    Returns hotels whose average room price is above the global average.

    This statistical query:
    - Calculates a global average room price using aggregation.
    - Annotates each hotel with its average room price, room count, and total capacity.
    - Filters hotels whose average price exceeds the global average.
    - Sorts results by average price and rating for better comparison.

    Complexity:
    - Involves cross-entity aggregation (Room → Hotel).
    - Performs a global vs. per-group aggregate comparison.
    - Optimized by using indexed fields: hotel_id, price_per_night, rating.
    - Uses prefetch_related to avoid N+1 queries on hotel-room relationships.

    Use case:
    Which hotels have an average room price above the overall average across all hotels
    — and how do their total capacity and rating compare?

    This helps:
    - Spot high-end hotels
    - Inform marketing or pricing strategies
    """

    global_avg_price = Room.objects.aggregate(global_avg=Avg('price_per_night'))['global_avg']

    stats = (
        Hotel.objects
        .prefetch_related('rooms')
        .annotate(
            avg_price=Avg('rooms__price_per_night'),
            room_count=Count('rooms'),
            total_capacity=Sum('rooms__capacity')
        )
        .filter(avg_price__gt=global_avg_price)
        .values(
            'id', 'name', 'rating', 'avg_price', 'room_count', 'total_capacity'
        )
        .order_by('-avg_price', '-rating')
    )

    return Response(list(stats))

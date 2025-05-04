###########################
##    IMPORTS SECTION    ##
###########################
# Python Libraries
import os
import random
from datetime import timedelta, date
from faker import Faker
# Django Libraries
import django


###########################
##     SETUP SECTION     ##
###########################

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MPP.loadtest_settings')
django.setup()

# Import our models
from bookings.models import Hotel, Room, Booking

# Test Configuration
NUM_HOTELS = 100_000
ROOMS_PER_HOTEL = 2           # yields ~200k rooms
BOOKINGS_PER_ROOM = 1         # yields ~200k bookings
BATCH_SIZE = 5_000

fake = Faker()


###########################
##    HELPERS SECTION    ##
###########################

def random_date(start: date, end: date) -> date:
    delta = end - start
    return start + timedelta(days=random.randint(0, delta.days))


###########################
##     RESET SECTION     ##
###########################

print("Clearing existing data...")
Booking.objects.all().delete()
Room.objects.all().delete()
Hotel.objects.all().delete()
print("Database cleared.")


###########################
##     SEEDING SECTION   ##
###########################

# 1) Generate Hotels
print(f"Seeding {NUM_HOTELS} hotels...")
hotels = []
for i in range(1, NUM_HOTELS + 1):
    hotels.append(Hotel(
        name=fake.unique.company()[:128],
        address=fake.address()[:512],
        rating=round(random.uniform(0.0, 5.0), 1)
    ))
    if i % BATCH_SIZE == 0:
        Hotel.objects.bulk_create(hotels)
        print(f"  Inserted {i} hotels...")
        hotels = []

if hotels:
    Hotel.objects.bulk_create(hotels)
    print(f"  Inserted final batch of hotels.")

print("Hotels seeded.")

# 2) Generate Rooms
print("Seeding rooms...")
rooms = []
all_hotels = list(Hotel.objects.all().values_list('id', flat=True))
room_counter = 0

for hid in all_hotels:
    for rnum in range(1, ROOMS_PER_HOTEL + 1):
        rooms.append(Room(
            number=rnum,
            capacity=random.randint(1, 4),
            price_per_night=round(random.uniform(50, 500), 2),
            hotel_id=hid
        ))
        room_counter += 1

        if room_counter % BATCH_SIZE == 0:
            Room.objects.bulk_create(rooms)
            print(f"  Inserted {room_counter} rooms...")
            rooms = []

if rooms:
    Room.objects.bulk_create(rooms)
    print(f"  Inserted final batch of rooms.")

print("Rooms seeded.")

# 3) Generate Bookings
print("Seeding bookings...")
bookings = []
states = [s[0] for s in Booking.BookingState.choices]
room_ids = list(Room.objects.all().values_list('id', flat=True))
booking_counter = 0

for rid in room_ids:
    for _ in range(BOOKINGS_PER_ROOM):
        start = random_date(date(2023, 1, 1), date(2025, 1, 1))
        end = random_date(start + timedelta(days=1), start + timedelta(days=14))
        bookings.append(Booking(
            customerName=fake.name()[:127],
            customerEmail=fake.email()[:127],
            customerPhone=fake.phone_number()[:20],
            startDate=start,
            endDate=end,
            state=random.choice(states)
        ))
        booking_counter += 1

        if booking_counter % BATCH_SIZE == 0:
            Booking.objects.bulk_create(bookings)
            print(f"  Inserted {booking_counter} bookings...")
            bookings = []

if bookings:
    Booking.objects.bulk_create(bookings)
    print(f"  Inserted final batch of bookings.")

print("Bookings seeded.")
print("Seeding complete!")

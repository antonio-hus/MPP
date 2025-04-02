###################
# IMPORTS SECTION #
###################
# Python Libraries
import json
# Django Libraries
from channels.generic.websocket import AsyncWebsocketConsumer


####################
# CONSUMER SECTION #
####################
class BookingConsumer(AsyncWebsocketConsumer):
    async def connect(self):

        # Add this connection to a group so we can broadcast to all subscribers.
        await self.channel_layer.group_add("booking_updates", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("booking_updates", self.channel_name)

    async def booking_update(self, event):

        # Called when new booking data is broadcasted.
        data = event["data"]
        await self.send(text_data=json.dumps(data))

###################
# IMPORTS SECTION #
###################
# Python Libraries
import os
# Django Libraries
from django.conf import settings
from django.http import FileResponse, Http404
# Django Rest Framework Libraries
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FileUploadParser
from rest_framework.response import Response
from rest_framework import status


#################
# VIEWS SECTION #
#################
@api_view(['POST'])
@parser_classes([FileUploadParser])
def upload_file(request, filename, format=None):

    # Request file object
    file_obj = request.data['file']

    # Upload to settings set file directory
    upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, 'wb+') as destination:
        for chunk in file_obj.chunks():
            destination.write(chunk)

    # Return successful status
    return Response({"message": "File uploaded successfully"}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def download_file(request, filename):

    # Get file from settings designated path
    file_path = os.path.join(settings.MEDIA_ROOT, "uploads", filename)

    # File was Found
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'), as_attachment=True)

    # File not Found
    else:
        raise Http404("File not found")

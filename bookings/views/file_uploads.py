###################
# IMPORTS SECTION #
###################
# Python Libraries
import os
# Django Libraries
from django.conf import settings
from django.http import FileResponse, Http404, JsonResponse
# Django Rest Framework Libraries
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FileUploadParser, MultiPartParser
from rest_framework.response import Response
from rest_framework import status


#################
# VIEWS SECTION #
#################
@api_view(['GET'])
def list_files(request):
    """
    :return: Returns the list of filenames from the server
    """
    upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
    if not os.path.exists(upload_dir):
        files = []
    else:
        files = os.listdir(upload_dir)
    return JsonResponse({"files": files})


@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_file(request, filename, format=None):
    """
    :input: Request must contain a FILE Object FILES['file']
    :return: Uploads a new file object to the server at MEDIA_ROOT/uploads/
    """

    # Get the uploaded file from request
    if 'file' not in request.FILES:
        return Response({"error": "No file found in request"}, status=status.HTTP_400_BAD_REQUEST)

    file_obj = request.FILES['file']

    # Upload to settings set file directory
    upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)

    # Use Django's file handling to save the file
    with open(file_path, 'wb') as destination:
        for chunk in file_obj.chunks():
            destination.write(chunk)

    # Return successful status
    return Response({
        "message": "File uploaded successfully",
        "path": f"/uploads/{filename}"
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def download_file(request, filename):
    """
    :return: Returns the file with the given filename from the server
    """

    # Get file from settings designated path
    file_path = os.path.join(settings.MEDIA_ROOT, "uploads", filename)

    # File was Found
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'), as_attachment=True)

    # File not Found
    else:
        raise Http404("File not found")

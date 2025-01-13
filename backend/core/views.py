from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
from django.http import JsonResponse
import os
from video.models import Face

def home(request):
    return HttpResponse("Página inicial") 

def list_media_files(request):

    media_root = settings.MEDIA_ROOT
    media_url = settings.MEDIA_URL
    face_folder = os.path.join(media_root, 'face')
    file_list = []

    if os.path.exists(face_folder):
        for root, dirs, files in os.walk(face_folder):
            for file in files:
                relative_path = os.path.relpath(os.path.join(root, file), media_root)
                file_list.append(f"{media_url}{relative_path}".replace("\\", "/"))
    else:
        return JsonResponse({"error": "Pasta 'face' não encontrada."}, status=404)

    return JsonResponse({"files": file_list})

def list_faces(request):
    """
    Lista todas as faces detectadas em vídeos, com seus IDs e URLs.
    """
    faces = Face.objects.all()
    data = [
        {
            "id": face.id,
            "image": face.image.url.replace("/media/home/polianar/Documentos/GitHub/ComputerVision/backend", ""),
            "coordinates": face.coordinates,
            "detected_at": face.detected_at,
            "video": face.video.id,
            "profile_id": face.profile.id if face.profile else None,
        }
        for face in faces
    ]
    return JsonResponse({"faces": data})


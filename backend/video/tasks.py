from django.shortcuts import render
from rest_framework import viewsets
from .models import Video, Face
from .serializers import VideoSerializer, FaceSerializer
from user_profile.tasks import process_video
from django.http import JsonResponse
import os
from django.conf import settings

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

class FaceViewSet(viewsets.ModelViewSet):
    queryset = Face.objects.all()
    serializer_class = FaceSerializer

def upload_video(request):
    if request.method == "POST":
        if 'video' not in request.FILES:
            return JsonResponse({"error": "Arquivo de vídeo não encontrado"}, status=400)

        video_file = request.FILES['video']
        video = Video.objects.create(file=video_file)

        video_id = video.id
        file_extension = os.path.splitext(video_file.name)[1] 
        new_filename = f"{video_id}{file_extension}"
        new_file_path = os.path.join(settings.MEDIA_ROOT, 'videos', new_filename)

        if not os.path.exists(os.path.dirname(new_file_path)):
            os.makedirs(os.path.dirname(new_file_path)) 

        try:
            os.rename(video.file.path, new_file_path)

            video.file.name = os.path.join('videos', new_filename)  
            video.save()
            print(f"Arquivo salvo em: {new_file_path}") 
        except Exception as e:
            return JsonResponse({"error": f"Erro ao salvar arquivo: {str(e)}"}, status=500)

        process_video.apply_async(args=[video.id], countdown=5)

        return JsonResponse({"status": "Vídeo em processamento", "video_id": video.id}, status=200)
    
    return JsonResponse({"error": "Método HTTP não permitido. Use POST."}, status=405)


def get_faces(request, video_id):
    try:
        video = Video.objects.get(id=video_id)
        faces = Face.objects.filter(video=video)
        faces_data = FaceSerializer(faces, many=True).data
        return JsonResponse({"faces": faces_data}, status=200)
    except Video.DoesNotExist:
        return JsonResponse({"error": "Vídeo não encontrado"}, status=404)

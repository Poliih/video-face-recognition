from django.shortcuts import render
from rest_framework import viewsets
from .models import Profile, FaceProfile
from .serializers import ProfileSerializer, FaceProfileSerializer
from django.http import JsonResponse
from user_profile.tasks import process_video
from video.models import Video

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class FaceProfileViewSet(viewsets.ModelViewSet):
    queryset = FaceProfile.objects.all()
    serializer_class = FaceProfileSerializer

def process_video_view(request, video_id):
    try:
        video = Video.objects.get(id=video_id)
        task = process_video.delay(video.id)

        return JsonResponse({'status': 'Tarefa iniciada com sucesso!', 'task_id': task.id})
    
    except Video.DoesNotExist:
        return JsonResponse({'error': 'Vídeo não encontrado!'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

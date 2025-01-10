from rest_framework import viewsets
from user_profile.models import Profile, FaceProfile
from video.models import Face
from user_profile.serializers import ProfileSerializer, FaceSerializer, FaceProfileSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from user_profile.tasks import process_video
from video.models import Video
from user_profile.utils import calculate_similarity
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class FaceViewSet(viewsets.ModelViewSet):
    queryset = Face.objects.all()
    serializer_class = FaceSerializer

class FaceProfileViewSet(viewsets.ModelViewSet):
    queryset = FaceProfile.objects.all()
    serializer_class = FaceProfileSerializer

@csrf_exempt
def process_video_view(request, video_id):
    try:
        video = Video.objects.get(id=video_id)
        task = process_video.delay(video.id)
        return JsonResponse({'status': 'Tarefa iniciada com sucesso!', 'task_id': task.id})
    except Video.DoesNotExist:
        return JsonResponse({'error': 'Vídeo não encontrado!'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
def associate_faces(request, profile_id):
    profile = Profile.objects.get(id=profile_id)
    face_ids = request.data.get('face_ids', [])
    
    for face_id in face_ids:
        face = Face.objects.get(id=face_id)
        face.profiles.add(profile)
        face.save()

    return Response({"message": "Faces associadas com sucesso!"})

@csrf_exempt
@api_view(['POST'])
def generate_suggestions(request):
    reference_images = request.data.get('reference_images', [])
    face_image = request.data.get('face_image', '')
    
    similar_faces = calculate_similarity(face_image, reference_images)

    return Response({"similar_faces": similar_faces})

@csrf_exempt
@api_view(['POST'])
def create_profile(request):
    if request.method == 'POST':
        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            return Response({'status': 'Perfil criado com sucesso', 'profile_id': profile.id})
        return Response(serializer.errors, status=400)

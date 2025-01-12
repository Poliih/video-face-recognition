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
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.permissions import AllowAny
import logging
from rest_framework.decorators import api_view, permission_classes


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
    
logger = logging.getLogger(__name__)
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def associate_faces_to_profile(request):
    try:
        logger.info("Requisição recebida: %s", request.data)

        profile_id = request.data.get('profile_id')
        face_ids = request.data.get('face_ids', [])

        if not profile_id or not face_ids:
            return Response({"error": "profile_id e face_ids são obrigatórios."}, status=400)

        logger.info("profile_id: %s, face_ids: %s", profile_id, face_ids)

        try:
            profile = Profile.objects.get(id=profile_id)
        except Profile.DoesNotExist:
            return Response({"error": "Perfil não encontrado."}, status=404)

        faces = Face.objects.filter(id__in=face_ids)

        logger.info("Faces encontradas: %s", faces)

        if len(faces) != len(face_ids):
            missing_ids = set(face_ids) - set(faces.values_list('id', flat=True))
            return Response({"error": f"As seguintes faces não foram encontradas: {list(missing_ids)}"}, status=404)

        for face in faces:
            FaceProfile.objects.update_or_create(profile=profile, face=face)

        return Response({"message": "Faces associadas com sucesso ao perfil!"})

    except Exception as e:
        logger.error("Erro: %s", str(e))
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
def generate_suggestions(request):
    reference_images = request.data.get('reference_images', [])
    face_image = request.data.get('face_image', '')
    
    similar_faces = calculate_similarity(face_image, reference_images)

    return Response({"similar_faces": similar_faces})

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])   
def create_profile(request):
    if request.method == 'POST':
        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            return Response({'status': 'Perfil criado com sucesso', 'profile_id': profile.id})
        return Response(serializer.errors, status=400)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny]) 
def list_profiles_with_faces(request):

    try:
        profiles = Profile.objects.prefetch_related('profile_faces__face').all()

        data = [
            {
                "id": profile.id,
                "name": profile.name,
                "faces": FaceSerializer(profile.profile_faces.all(), many=True).data
            }
            for profile in profiles
        ]
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def list_faces_sem_perfil(request):
    try:

        faces_sem_perfil = Face.objects.filter(profile__isnull=True)
        serializer = FaceSerializer(faces_sem_perfil, many=True)
        return Response({"faces_sem_perfil": serializer.data}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['PUT'])
@permission_classes([AllowAny]) 
def update_profile(request, profile_id):

    try:
        profile = get_object_or_404(Profile, id=profile_id)
        profile.name = request.data.get('name', profile.name)

        face_ids = request.data.get('face_ids', [])
        if face_ids:
            faces = Face.objects.filter(id__in=face_ids)
            profile.profile_faces.clear()  
            for face in faces:
                FaceProfile.objects.create(profile=profile, face=face)

        profile.save()
        return Response({'status': 'Perfil atualizado com sucesso'})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])  
def delete_profile(request, profile_id):

    try:
        print(f"Deletando perfil com ID: {profile_id}")
        profile = get_object_or_404(Profile, id=profile_id)

        if profile:
            profile.delete()
            return Response({'status': 'Perfil deletado com sucesso'}, status=204)
        else:
            return Response({'error': 'Perfil não encontrado'}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=500)




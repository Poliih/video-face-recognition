from django.shortcuts import render
from rest_framework import viewsets
from .models import Video, Face
from .serializers import VideoSerializer, FaceSerializer,FaceSerializer2, FaceSimplifiedSerializer
from user_profile.tasks import process_video
from django.http import JsonResponse, HttpResponse
import os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from .models import Face
from user_profile.models import Profile, FaceProfile
from .serializers import FaceSerializer, FaceProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

class FaceViewSet(viewsets.ModelViewSet):
    queryset = Face.objects.all()
    serializer_class = FaceSerializer

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def associar_face_a_perfil(request):
    face_id = request.data.get("face_id")
    profile_id = request.data.get("profile_id")
    
    if not face_id or not profile_id:
        return Response({"error": "Face ID e Profile ID são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        face = Face.objects.get(id=face_id)
    except Face.DoesNotExist:
        return Response({"error": "Face não encontrada."}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({"error": "Perfil não encontrado."}, status=status.HTTP_404_NOT_FOUND)
    
    face_profile = FaceProfile.objects.create(face=face, profile=profile)
    
    serializer = FaceProfileSerializer(face_profile)
    return Response({"message": "Face associada ao perfil com sucesso", "data": serializer.data}, status=status.HTTP_201_CREATED)


@csrf_exempt
def upload_video(request):
    if request.method == "POST":
        if 'video' not in request.FILES:
            return JsonResponse({"error": "Vídeo não encontrado"}, status=400)

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
            return JsonResponse({"error": "Erro ao salvar vídeo"}, status=500)

        process_video.apply_async(args=[video.id], countdown=5)

        return JsonResponse({"status": "Processando vídeo", "video_id": video.id}, status=200)
    
    return JsonResponse({"error": "Método inválido. Use POST."}, status=405)

@csrf_exempt
def get_faces(request, video_id):
    try:
        video = Video.objects.get(id=video_id)
        faces = Face.objects.filter(video=video)
        faces_data = FaceSerializer(faces, many=True).data
        return JsonResponse({"faces": faces_data}, status=200)
    except Video.DoesNotExist:
        return JsonResponse({"error": "Vídeo não encontrado"}, status=404)
    
@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def list_faces_sem_perfil2(request):
    try:
        list_faces_sem_perfil2 = Face.objects.filter(profile__isnull=True)
        
        faces_data = []
        for face in list_faces_sem_perfil2:
            image_url = face.image.url

            prefix_length = 61
            image_url = image_url[prefix_length:]

            image_url = request.build_absolute_uri(image_url)

            faces_data.append({
                "id": face.id,
                "image": image_url
            })

        return Response({"faces_sem_perfil": faces_data}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

    

class GetFacesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        faces = Face.objects.all()
        
        image_urls = [request.build_absolute_uri(face.image.url) for face in faces]
        
        return Response({"image_urls": image_urls}, status=status.HTTP_200_OK)


class FaceImageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        faces = Face.objects.all()

        serializer = FaceSerializer2(faces, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
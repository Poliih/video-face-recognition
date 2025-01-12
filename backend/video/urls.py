from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VideoViewSet, FaceViewSet,GetFacesView, FaceImageView, upload_video, get_faces,  associar_face_a_perfil,list_faces_sem_perfil2
from django.conf import settings
from django.conf.urls.static import static


router = DefaultRouter()
router.register(r'videos', VideoViewSet)
router.register(r'faces', FaceViewSet)

urlpatterns = [
    path('upload/', upload_video, name='upload_video'),
    path('faces/<int:video_id>/', GetFacesView.as_view(), name='GetFacesView'),
    path('', include(router.urls)), 
    path('faces/associar/', associar_face_a_perfil, name='associar_face_perfil'),
    path('list_faces_sem_perfil2/', list_faces_sem_perfil2, name='list_faces_sem_perfil2'),
    path('faces1/', FaceImageView.as_view(), name='face-image-view'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


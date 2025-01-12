from django.urls import path, include
from rest_framework.routers import DefaultRouter
from video.models import Face
from .views import FaceProfileViewSet, process_video_view, create_profile, list_profiles_with_faces,list_faces_sem_perfil, update_profile, delete_profile, associate_faces_to_profile, generate_suggestions
router = DefaultRouter()
router.register('faces', FaceProfileViewSet)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', include(router.urls)),
    path('process_video/<int:video_id>/', process_video_view, name='process_video'),
    path('create_profile/', create_profile, name='create_profile'),
    path('list_profiles_with_faces/', list_profiles_with_faces, name='list_profiles_with_faces'),
    path('update_profile/<int:profile_id>/', update_profile, name='update_profile'),  
    path('delete_profile/<int:profile_id>/', delete_profile, name='delete_profile'),
    path('associate_faces_to_profile/', associate_faces_to_profile, name='associate_faces_to_profile'),
    path('generate_suggestions/', generate_suggestions, name='generate_suggestions'),
    path('list_faces_sem_perfil/', list_faces_sem_perfil, name='list_faces_sem_perfil'),
]

if settings.DEBUG:  
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
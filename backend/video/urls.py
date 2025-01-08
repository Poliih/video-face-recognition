from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VideoViewSet, FaceViewSet, upload_video, get_faces  

router = DefaultRouter()
router.register(r'videos', VideoViewSet)
router.register(r'faces', FaceViewSet)

urlpatterns = [
    path('upload/', upload_video, name='upload_video'),  
    path('faces/<int:video_id>/', get_faces, name='get_faces'),
    path('', include(router.urls)), 
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FaceProfileViewSet, process_video_view

router = DefaultRouter()
router.register('faces', FaceProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('process_video/', process_video_view, name='process_video'),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VideoViewSet, FaceViewSet

router = DefaultRouter()
router.register(r'videos', VideoViewSet)
router.register(r'faces', FaceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

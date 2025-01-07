from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, FaceProfileViewSet

router = DefaultRouter()
router.register(r'user_profiles', ProfileViewSet)
router.register(r'faceprofiles', FaceProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

from django.shortcuts import render
from rest_framework import viewsets
from .models import Profile, FaceProfile
from .serializers import ProfileSerializer, FaceProfileSerializer

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class FaceProfileViewSet(viewsets.ModelViewSet):
    queryset = FaceProfile.objects.all()
    serializer_class = FaceProfileSerializer


from django.shortcuts import render
from rest_framework import viewsets
from .models import Video, Face
from .serializers import VideoSerializer, FaceSerializer

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

class FaceViewSet(viewsets.ModelViewSet):
    queryset = Face.objects.all()
    serializer_class = FaceSerializer


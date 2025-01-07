from rest_framework import serializers
from .models import Video, Face

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'file', 'uploaded_at']

class FaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Face
        fields = ['id', 'image', 'coordinates', 'detected_at', 'video']

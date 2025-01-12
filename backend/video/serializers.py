from rest_framework import serializers
from .models import Video, Face
from django.conf import settings
from user_profile.models import FaceProfile

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'file', 'uploaded_at']

class FaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Face
        fields = ['id', 'image', 'coordinates', 'detected_at', 'video', 'profile']

class FaceProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaceProfile
        fields = ['profile', 'face']


class FaceSimplifiedSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Face
        fields = ['image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        image_url = obj.image.url
        return request.build_absolute_uri(image_url)

class FaceSerializer2(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Face
        fields = ['image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url

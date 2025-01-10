from rest_framework import serializers
from user_profile.models import Profile, FaceProfile
from video.models import Face 


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'name', 'created_at']

class FaceSerializer(serializers.ModelSerializer):
    profiles = ProfileSerializer(many=True)  

    class Meta:
        model = Face
        fields = ['id', 'image', 'coordinates', 'profiles']

class FaceProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaceProfile
        fields = ['id', 'profile', 'face']

from django.db import models

class Profile(models.Model):
    name = models.CharField(max_length=300)

    def __str__(self):
        return self.name

class FaceProfile(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='profile_faces')
    face = models.ForeignKey('video.Face', related_name='face_profiles', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('profile', 'face')
    
    def __str__(self):
        return f"{self.profile.name} - {self.face.id}"

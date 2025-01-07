from django.db import models

class Profile(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class FaceProfile(models.Model):
    profile = models.ForeignKey(Profile, related_name='faces', on_delete=models.CASCADE)
    face = models.ForeignKey('video.Face', related_name='profiles', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.profile.name} - {self.face.id}"

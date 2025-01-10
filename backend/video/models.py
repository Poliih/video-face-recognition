from django.db import models
from user_profile.associate_faces import associate_faces_to_profiles


class Video(models.Model):
    file = models.FileField(upload_to='videos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name

class Face(models.Model):
    video = models.ForeignKey(Video, related_name='faces', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='faces/')
    coordinates = models.CharField(max_length=100)
    detected_at = models.DateTimeField(auto_now_add=True)
    profile = models.ForeignKey('user_profile.Profile', related_name='video_faces', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"Face {self.id} in {self.video.file.name}"

    def get_profiles(self):
        from django.apps import apps
        Profile = apps.get_model('user_profile', 'Profile')  
        return Profile.objects.all()

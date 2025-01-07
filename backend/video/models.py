from django.db import models

class Video(models.Model):
    file = models.FileField(upload_to='videos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name

class Face(models.Model):
    video = models.ForeignKey(Video, related_name='faces', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='faces/')
    coordinates = models.JSONField()  
    detected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Face {self.id} in {self.video.file.name}"

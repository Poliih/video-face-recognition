from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/video/', include('video.urls')),
    path('api/user_profile/', include('user_profile.urls')),
]

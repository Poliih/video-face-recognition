from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from .import views
from django.urls import path, re_path
from django.views.static import serve
from django.conf.urls.static import static
from django.shortcuts import render


def index(request):
    return render(request, 'index.html')

urlpatterns = [
    path('', index, name='index'),
    path('admin/', admin.site.urls),
    path('api/video/', include('video.urls')),
    path('api/user_profile/', include('user_profile.urls')),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    path('api/media-files/', views.list_media_files, name='list-media-files'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

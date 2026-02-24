from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/',          admin.site.urls),
    path('api/auth/',       include('apps.accounts.urls')),
    path('api/journal/',    include('apps.journal.urls')),
    path('api/todos/',      include('apps.todos.urls')),
    path('api/interviews/', include('apps.interviews.urls')),

    # API Docs
    path('api/schema/',         SpectacularAPIView.as_view(),     name='schema'),
    path('api/docs/',           SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/docs/redoc/',     SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),

    path('api/auth/social/', include('allauth.socialaccount.urls')),
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
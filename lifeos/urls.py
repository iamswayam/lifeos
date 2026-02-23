from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/',      admin.site.urls),
    path('api/auth/',   include('apps.accounts.urls')),
    path('api/journal/', include('apps.journal.urls')),
    path('api/todos/',    include('apps.todos.urls')),
]
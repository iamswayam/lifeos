from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, LogoutView, UserProfileView, ChangePasswordView
from .social_auth import google_login

urlpatterns = [
    path('register/',        RegisterView.as_view(),      name='auth-register'),
    path('login/',           LoginView.as_view(),          name='auth-login'),
    path('logout/',          LogoutView.as_view(),         name='auth-logout'),
    path('token/refresh/',   TokenRefreshView.as_view(),   name='token-refresh'),
    path('me/',              UserProfileView.as_view(),    name='auth-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('google/',          google_login,                 name='google-login'),
]
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
import os

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Token required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            os.environ.get('GOOGLE_CLIENT_ID')
        )

        email      = idinfo.get('email')
        name       = idinfo.get('name', '')
        first_name = idinfo.get('given_name', '')
        last_name  = idinfo.get('family_name', '')
        picture    = idinfo.get('picture', '')

        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username':   email.split('@')[0],
                'first_name': first_name,
                'last_name':  last_name,
            }
        )

        tokens = get_tokens_for_user(user)

        return Response({
            'tokens': tokens,
            'user': {
                'id':         user.id,
                'username':   user.username,
                'email':      user.email,
                'first_name': user.first_name,
            },
            'created': created
        })

    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
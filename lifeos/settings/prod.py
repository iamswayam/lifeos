from .base import *

DEBUG = False

ALLOWED_HOSTS = []  # Add your domain later

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'lifeos_db',
        'USER': 'lifeos_user',
        'PASSWORD': 'lifeos_pass',
        'HOST': 'db',
        'PORT': '5432',
    }
}
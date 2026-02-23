from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AuthTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url    = '/api/auth/login/'
        self.me_url       = '/api/auth/me/'

    def test_register_success(self):
        response = self.client.post(self.register_url, {
            'username':  'testuser',
            'email':     'test@example.com',
            'password':  'Test@1234',
            'password2': 'Test@1234',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)

    def test_register_password_mismatch(self):
        response = self.client.post(self.register_url, {
            'username':  'testuser',
            'email':     'test@example.com',
            'password':  'Test@1234',
            'password2': 'Wrong@1234',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='Test@1234'
        )
        response = self.client.post(self.login_url, {
            'email':    'test@example.com',
            'password': 'Test@1234',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)

    def test_login_wrong_password(self):
        User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='Test@1234'
        )
        response = self.client.post(self.login_url, {
            'email':    'test@example.com',
            'password': 'WrongPassword',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_requires_auth(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_with_auth(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='Test@1234'
        )
        self.client.force_authenticate(user=user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')
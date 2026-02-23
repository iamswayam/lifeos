from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import JournalEntry

User = get_user_model()


class JournalTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user   = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='Test@1234'
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/api/journal/entries/'

    def test_create_entry(self):
        response = self.client.post(self.url, {
            'title':   'Test Entry',
            'content': 'Test content for journal entry.',
            'mood':    'good',
            'tags':    ['test'],
            'date':    '2026-02-24',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Entry')
        self.assertEqual(response.data['word_count'], 5)

    def test_list_entries(self):
        JournalEntry.objects.create(
            user=self.user, title='Entry 1',
            content='Content 1', mood='good', date='2026-02-24'
        )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_user_cannot_see_others_entries(self):
        other_user = User.objects.create_user(
            username='other', email='other@example.com', password='Test@1234'
        )
        JournalEntry.objects.create(
            user=other_user, title='Private',
            content='Private content', mood='good', date='2026-02-24'
        )
        response = self.client.get(self.url)
        self.assertEqual(len(response.data), 0)

    def test_future_date_rejected(self):
        response = self.client.post(self.url, {
            'title':   'Future Entry',
            'content': 'Content',
            'mood':    'good',
            'date':    '2099-01-01',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
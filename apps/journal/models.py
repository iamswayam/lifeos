from django.db import models
from django.conf import settings
from datetime import date


class JournalEntry(models.Model):

    MOOD_CHOICES = [
        ('great',    'Great'),
        ('good',     'Good'),
        ('neutral',  'Neutral'),
        ('bad',      'Bad'),
        ('terrible', 'Terrible'),
    ]

    user       = models.ForeignKey(
                     settings.AUTH_USER_MODEL,
                     on_delete=models.CASCADE,
                     related_name='journal_entries'
                 )
    title      = models.CharField(max_length=255)
    content    = models.TextField()
    mood       = models.CharField(max_length=20, choices=MOOD_CHOICES, default='neutral')
    tags       = models.JSONField(default=list, blank=True)
    date       = models.DateField(default=date.today)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name        = 'Journal Entry'
        verbose_name_plural = 'Journal Entries'

    def __str__(self):
        return f"{self.user.email} — {self.title} ({self.date})"

    @property
    def word_count(self):
        return len(self.content.split())
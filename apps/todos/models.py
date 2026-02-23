from django.db import models
from django.conf import settings
from datetime import date


class Todo(models.Model):

    PRIORITY_CHOICES = [
        ('low',    'Low'),
        ('medium', 'Medium'),
        ('high',   'High'),
    ]

    STATUS_CHOICES = [
        ('pending',     'Pending'),
        ('in_progress', 'In Progress'),
        ('done',        'Done'),
    ]

    user        = models.ForeignKey(
                      settings.AUTH_USER_MODEL,
                      on_delete=models.CASCADE,
                      related_name='todos'
                  )
    title       = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority    = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status      = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    category    = models.CharField(max_length=100, blank=True)
    due_date    = models.DateField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date', '-priority']
        verbose_name        = 'Todo'
        verbose_name_plural = 'Todos'

    def __str__(self):
        return f"{self.user.email} — {self.title} [{self.priority}]"

    @property
    def is_overdue(self):
        if self.due_date and self.status != 'done':
            return self.due_date < date.today()
        return False
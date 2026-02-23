from django.db import models
from django.conf import settings


class Interview(models.Model):

    ROUND_TYPE_CHOICES = [
        ('screening',  'Screening'),
        ('technical',  'Technical'),
        ('hr',         'HR'),
        ('final',      'Final'),
        ('offer',      'Offer'),
    ]

    STATUS_CHOICES = [
        ('scheduled',  'Scheduled'),
        ('completed',  'Completed'),
        ('cancelled',  'Cancelled'),
        ('no_show',    'No Show'),
    ]

    RESULT_CHOICES = [
        ('waiting',   'Waiting'),
        ('selected',  'Selected'),
        ('rejected',  'Rejected'),
        ('on_hold',   'On Hold'),
    ]

    MODE_CHOICES = [
        ('online',   'Online'),
        ('offline',  'Offline'),
        ('hybrid',   'Hybrid'),
    ]

    PLATFORM_CHOICES = [
        ('zoom',       'Zoom'),
        ('teams',      'Microsoft Teams'),
        ('meet',       'Google Meet'),
        ('on_site',    'On Site'),
        ('phone',      'Phone Call'),
        ('other',      'Other'),
    ]

    # Basic Info
    user            = models.ForeignKey(
                          settings.AUTH_USER_MODEL,
                          on_delete=models.CASCADE,
                          related_name='interviews'
                      )
    company_name    = models.CharField(max_length=255)
    role            = models.CharField(max_length=255)
    package_offered = models.CharField(max_length=100, blank=True)
    job_url         = models.URLField(blank=True)

    # HR Info
    hr_name         = models.CharField(max_length=255, blank=True)
    hr_contact      = models.CharField(max_length=255, blank=True)

    # Round Info
    round_number    = models.PositiveIntegerField(default=1)
    round_type      = models.CharField(max_length=20, choices=ROUND_TYPE_CHOICES, default='screening')
    mode            = models.CharField(max_length=10, choices=MODE_CHOICES, default='online')
    platform        = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='other')
    location        = models.CharField(max_length=255, blank=True)

    # Schedule
    scheduled_at    = models.DateTimeField()
    follow_up_date  = models.DateField(null=True, blank=True)

    # Status & Result
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    result          = models.CharField(max_length=20, choices=RESULT_CHOICES, default='waiting')

    # Notes
    prep_notes      = models.TextField(blank=True)
    feedback        = models.TextField(blank=True)

    # Timestamps
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['scheduled_at']
        verbose_name        = 'Interview'
        verbose_name_plural = 'Interviews'

    def __str__(self):
        return f"{self.user.email} — {self.company_name} ({self.role}) Round {self.round_number}"
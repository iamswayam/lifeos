from django.contrib import admin
from .models import Interview

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display  = [
        'company_name', 'role', 'round_number',
        'round_type', 'scheduled_at', 'status', 'result', 'user'
    ]
    list_filter   = ['status', 'result', 'round_type', 'mode']
    search_fields = ['company_name', 'role', 'hr_name', 'user__email']
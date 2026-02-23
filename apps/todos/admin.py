from django.contrib import admin
from .models import Todo

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display  = ['title', 'user', 'priority', 'status', 'due_date', 'is_overdue']
    list_filter   = ['status', 'priority']
    search_fields = ['title', 'description', 'user__email']
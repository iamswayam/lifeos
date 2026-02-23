from django.contrib import admin
from .models import JournalEntry


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display  = ['title', 'user', 'mood', 'date', 'word_count']
    list_filter   = ['mood', 'date']
    search_fields = ['title', 'content', 'user__email']
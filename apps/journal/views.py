from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache

from .models import JournalEntry
from .serializers import JournalEntrySerializer


class JournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class   = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['mood', 'date']
    search_fields      = ['title', 'content', 'tags']
    ordering_fields    = ['date', 'created_at']

    def get_queryset(self):
        # Users can only see their own entries
        return JournalEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        # Invalidate cache when new entry is created
        cache_key = f"journal_list_{self.request.user.id}"
        cache.delete(cache_key)

    def perform_update(self, serializer):
        serializer.save()
        # Invalidate cache on update
        cache_key = f"journal_list_{self.request.user.id}"
        cache.delete(cache_key)

    def perform_destroy(self, instance):
        instance.delete()
        # Invalidate cache on delete
        cache_key = f"journal_list_{self.request.user.id}"
        cache.delete(cache_key)

    def list(self, request, *args, **kwargs):
        # Try to get from cache first
        cache_key = f"journal_list_{request.user.id}"
        cached    = cache.get(cache_key)

        if cached:
            return Response(cached)

        response = super().list(request, *args, **kwargs)

        # Cache for 5 minutes
        cache.set(cache_key, response.data, timeout=300)
        return response

    @action(detail=False, methods=['get'], url_path='moods')
    def mood_summary(self, request):
        """Return count of entries per mood for the current user."""
        from django.db.models import Count
        summary = (
            JournalEntry.objects
            .filter(user=request.user)
            .values('mood')
            .annotate(count=Count('id'))
            .order_by('mood')
        )
        return Response(summary)
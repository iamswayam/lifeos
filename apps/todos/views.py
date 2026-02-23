from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache

from .models import Todo
from .serializers import TodoSerializer, TodoStatusSerializer


class TodoViewSet(viewsets.ModelViewSet):
    serializer_class   = TodoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['status', 'priority', 'category']
    search_fields      = ['title', 'description']
    ordering_fields    = ['due_date', 'priority', 'created_at']

    def get_queryset(self):
        return Todo.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        self._invalidate_cache()

    def perform_update(self, serializer):
        serializer.save()
        self._invalidate_cache()

    def perform_destroy(self, instance):
        instance.delete()
        self._invalidate_cache()

    def _invalidate_cache(self):
        cache_key = f"todo_list_{self.request.user.id}"
        cache.delete(cache_key)

    def list(self, request, *args, **kwargs):
        cache_key = f"todo_list_{request.user.id}"
        cached    = cache.get(cache_key)

        if cached:
            return Response(cached)

        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=300)
        return response

    @action(detail=True, methods=['patch'], url_path='toggle_status')
    def toggle_status(self, request, pk=None):
        """Cycle through pending → in_progress → done → pending."""
        todo = self.get_object()
        cycle = {
            'pending':     'in_progress',
            'in_progress': 'done',
            'done':        'pending',
        }
        todo.status = cycle[todo.status]
        todo.save()
        self._invalidate_cache()
        return Response(TodoStatusSerializer(todo).data)

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue(self, request):
        """Return all overdue todos for the current user."""
        from datetime import date
        overdue_todos = Todo.objects.filter(
            user=request.user,
            due_date__lt=date.today()
        ).exclude(status='done')
        serializer = self.get_serializer(overdue_todos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Return count of todos grouped by status."""
        from django.db.models import Count
        data = (
            Todo.objects
            .filter(user=request.user)
            .values('status')
            .annotate(count=Count('id'))
        )
        return Response(data)
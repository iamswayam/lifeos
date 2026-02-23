from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Interview
from .serializers import InterviewSerializer, InterviewFeedbackSerializer


class InterviewViewSet(viewsets.ModelViewSet):
    serializer_class   = InterviewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['status', 'result', 'round_type', 'mode']
    search_fields      = ['company_name', 'role', 'hr_name']
    ordering_fields    = ['scheduled_at', 'created_at', 'round_number']

    def get_queryset(self):
        return Interview.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='upcoming')
    def upcoming(self, request):
        """Return interviews scheduled in the next 7 days."""
        from datetime import timedelta
        now      = timezone.now()
        next_week = now + timedelta(days=7)
        upcoming  = Interview.objects.filter(
            user=request.user,
            scheduled_at__gte=now,
            scheduled_at__lte=next_week,
            status='scheduled'
        ).order_by('scheduled_at')
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-company')
    def by_company(self, request):
        """Return all interviews grouped by company."""
        from django.db.models import Count
        data = (
            Interview.objects
            .filter(user=request.user)
            .values('company_name')
            .annotate(total_rounds=Count('id'))
            .order_by('company_name')
        )
        return Response(data)

    @action(detail=True, methods=['patch'], url_path='add-feedback')
    def add_feedback(self, request, pk=None):
        """Add feedback and result after interview is done."""
        interview  = self.get_object()
        serializer = InterviewFeedbackSerializer(
            interview,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(InterviewSerializer(interview).data)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Return summary stats for the current user."""
        from django.db.models import Count
        qs = Interview.objects.filter(user=request.user)
        data = {
            'total':     qs.count(),
            'scheduled': qs.filter(status='scheduled').count(),
            'completed': qs.filter(status='completed').count(),
            'selected':  qs.filter(result='selected').count(),
            'rejected':  qs.filter(result='rejected').count(),
            'on_hold':   qs.filter(result='on_hold').count(),
        }
        return Response(data)
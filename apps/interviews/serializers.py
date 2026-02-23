from rest_framework import serializers
from django.utils import timezone
from .models import Interview


class InterviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model  = Interview
        fields = [
            'id', 'user',
            'company_name', 'role', 'package_offered', 'job_url',
            'hr_name', 'hr_contact',
            'round_number', 'round_type', 'mode', 'platform', 'location',
            'scheduled_at', 'follow_up_date',
            'status', 'result',
            'prep_notes', 'feedback',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_scheduled_at(self, value):
        # Allow past dates — you may want to log old interviews
        return value

    def validate(self, attrs):
        # If result is selected/rejected, status should be completed
        result = attrs.get('result', None)
        status = attrs.get('status', None)
        if result in ['selected', 'rejected'] and status != 'completed':
            raise serializers.ValidationError({
                "status": "Status must be 'completed' when result is selected or rejected."
            })
        return attrs


class InterviewFeedbackSerializer(serializers.ModelSerializer):
    """Lightweight serializer just for adding feedback after interview."""
    class Meta:
        model  = Interview
        fields = ['id', 'feedback', 'result', 'status']
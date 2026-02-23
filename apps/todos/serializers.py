from rest_framework import serializers
from datetime import date
from .models import Todo


class TodoSerializer(serializers.ModelSerializer):
    is_overdue = serializers.ReadOnlyField()
    user       = serializers.StringRelatedField(read_only=True)

    class Meta:
        model  = Todo
        fields = [
            'id', 'user', 'title', 'description',
            'priority', 'status', 'category',
            'due_date', 'is_overdue',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_due_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value


class TodoStatusSerializer(serializers.ModelSerializer):
    """Lightweight serializer just for status toggle."""
    class Meta:
        model  = Todo
        fields = ['id', 'status']
from rest_framework import serializers
from .models import JournalEntry


class JournalEntrySerializer(serializers.ModelSerializer):
    word_count = serializers.ReadOnlyField()
    user       = serializers.StringRelatedField(read_only=True)

    class Meta:
        model  = JournalEntry
        fields = [
            'id', 'user', 'title', 'content',
            'mood', 'tags', 'date',
            'word_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Journal date cannot be in the future.")
        return value

    def validate_tags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list.")
        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 tags allowed.")
        return value
from rest_framework import serializers
from django.db import transaction
from .models import DJPersona, PersonaBlend, PersonaBlendComponent, PersonaPreset

class DJPersonaSerializer(serializers.ModelSerializer):
    voice_style_display = serializers.CharField(
        source='get_voice_style_display',
        read_only=True
    )
    transition_style_display = serializers.CharField(
        source='get_transition_style_display',
        read_only=True
    )
    curation_style_display = serializers.CharField(
        source='get_curation_style_display',
        read_only=True
    )
    
    class Meta:
        model = DJPersona
        fields = [
            'id', 'name', 'description', 'created_by', 'is_preset',
            'created_at', 'updated_at', 'voice_style', 'voice_style_display',
            'transition_style', 'transition_style_display',
            'curation_style', 'curation_style_display',
            'energy_level', 'experimentalism', 'genre_diversity',
            'commentary_frequency', 'trivia_frequency'
        ]
        read_only_fields = ['created_at', 'updated_at']

class PersonaBlendComponentSerializer(serializers.ModelSerializer):
    persona = DJPersonaSerializer(read_only=True)
    persona_id = serializers.PrimaryKeyRelatedField(
        queryset=DJPersona.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = PersonaBlendComponent
        fields = ['id', 'persona', 'persona_id', 'weight']
    
    def create(self, validated_data):
        persona = validated_data.pop('persona_id')
        return PersonaBlendComponent.objects.create(
            persona=persona,
            **validated_data
        )

class PersonaBlendSerializer(serializers.ModelSerializer):
    components = PersonaBlendComponentSerializer(many=True)
    
    class Meta:
        model = PersonaBlend
        fields = ['id', 'session', 'created_at', 'is_active', 'components']
        read_only_fields = ['created_at']
    
    def validate_components(self, value):
        # Ensure weights sum to 1
        total_weight = sum(component['weight'] for component in value)
        if not 0.99 <= total_weight <= 1.01:  # Allow small floating point errors
            raise serializers.ValidationError(
                "Component weights must sum to 1.0"
            )
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        components_data = validated_data.pop('components')
        blend = PersonaBlend.objects.create(**validated_data)
        
        for component_data in components_data:
            PersonaBlendComponent.objects.create(
                blend=blend,
                **component_data
            )
        
        return blend
    
    @transaction.atomic
    def update(self, instance, validated_data):
        components_data = validated_data.pop('components')
        
        # Update blend
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Clear existing components
        instance.components.all().delete()
        
        # Create new components
        for component_data in components_data:
            PersonaBlendComponent.objects.create(
                blend=instance,
                **component_data
            )
        
        return instance

class PersonaPresetSerializer(serializers.ModelSerializer):
    persona = DJPersonaSerializer()
    category_display = serializers.CharField(
        source='get_category_display',
        read_only=True
    )
    
    class Meta:
        model = PersonaPreset
        fields = [
            'id', 'name', 'description', 'category',
            'category_display', 'persona', 'is_public',
            'created_at'
        ]
        read_only_fields = ['created_at']
    
    @transaction.atomic
    def create(self, validated_data):
        persona_data = validated_data.pop('persona')
        persona = DJPersona.objects.create(**persona_data)
        return PersonaPreset.objects.create(
            persona=persona,
            **validated_data
        )

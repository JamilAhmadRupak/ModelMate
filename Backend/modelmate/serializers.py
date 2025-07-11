from rest_framework import serializers
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db.models import Avg, Count
from .models import User, ModelCategory, AIModel, Review, Discussion, Comment


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    token = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm', 'bio', 'location', 
            'profile_picture', 'website', 'linkedin', 'github', 
            'expertise_areas', 'token'
        ]
        extra_kwargs = {
            'email': {'required': True},
            # 'first_name': {'required': True},
            # 'last_name': {'required': True},
        }

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def create(self, validated_data):
        """Create user and generate token"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        # Create token
        token = Token.objects.create(user=user)
        user.token = token.key

        return user


# serializers.py
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        request = self.context.get('request')
        if not username or not password:
            raise serializers.ValidationError('Must include "username" and "password".')
        user = authenticate(request=request, username=username, password=password)
        if not user:
            raise serializers.ValidationError('Unable to log in with provided credentials.')
        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value

    def validate(self, attrs):
        """Validate new password confirmation"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs

    def save(self):
        """Update user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user serializer for nested representations"""
    """Mainly for use as a nested serializer in other objects (like reviews, comments, etc.)."""
    full_name = serializers.CharField(source='full_name_or_username', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'profile_picture']


class UserSerializer(serializers.ModelSerializer):
    """Full user serializer"""
    full_name = serializers.CharField(source='full_name_or_username', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'bio', 'location', 'profile_picture', 'website', 'linkedin', 
            'github', 'expertise_areas', 'reviews_count', 'discussions_count',
            'helpful_votes_received', 'date_joined', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'reviews_count', 'discussions_count', 'helpful_votes_received',
            'date_joined', 'created_at', 'updated_at'
        ]


class ModelCategorySerializer(serializers.ModelSerializer):
    """Serializer for model categories"""
    models_count = serializers.ReadOnlyField()

    class Meta:
        model = ModelCategory
        fields = ['id', 'name', 'description', 'slug', 'models_count', 'created_at']
        read_only_fields = ['created_at']


class AIModelListSerializer(serializers.ModelSerializer):
    """Serializer for AI model list view"""
    category = ModelCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = AIModel
        fields = [
            'id', 'name', 'creator', 'version', 'category', 'category_id',
            'description', 'average_rating', 'reviews_count', 'release_date'
        ]


class AIModelSerializer(serializers.ModelSerializer):
    """Detailed serializer for AI models"""
    category = ModelCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    user_has_reviewed = serializers.SerializerMethodField()
    recent_reviews = serializers.SerializerMethodField()

    class Meta:
        model = AIModel
        fields = [
            'id', 'name', 'creator', 'version', 'category', 'category_id',
            'description', 'url', 'release_date', 'size', 'architecture', 
            'license', 'average_rating', 'reviews_count', 'user_has_reviewed',
            'recent_reviews'
        ]

    def get_user_has_reviewed(self, obj):
        """Check if current user has reviewed this model"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.reviews.filter(user=request.user).exists()
        return False

    def get_recent_reviews(self, obj):
        """Get recent reviews for this model"""
        recent_reviews = obj.reviews.select_related('user').order_by('-created_at')[:3]
        return ReviewListSerializer(recent_reviews, many=True).data

    def create(self, validated_data):
        """Handle category assignment during creation"""
        category_id = validated_data.pop('category_id', None)
        model = AIModel.objects.create(**validated_data)

        if category_id:
            try:
                category = ModelCategory.objects.get(id=category_id)
                model.category = category
                model.save()
            except ModelCategory.DoesNotExist:
                pass

        return model

    def update(self, instance, validated_data):
        """Handle category assignment during update"""
        category_id = validated_data.pop('category_id', None)

        if category_id:
            try:
                category = ModelCategory.objects.get(id=category_id)
                instance.category = category
            except ModelCategory.DoesNotExist:
                pass

        return super().update(instance, validated_data)


class ReviewListSerializer(serializers.ModelSerializer):
    """Serializer for review list view"""
    user = UserMinimalSerializer(read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    model_id = serializers.IntegerField(source='model.id', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'model_name', 'model_id', 'title', 'overall_rating',
            'helpful_votes', 'created_at'
        ]


class ReviewSerializer(serializers.ModelSerializer):
    """Detailed serializer for reviews"""
    user = UserMinimalSerializer(read_only=True)
    model = AIModelListSerializer(read_only=True)
    model_id = serializers.IntegerField(write_only=True)
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'model', 'model_id', 'accuracy', 'speed', 
            'cost_efficiency', 'ease_of_use', 'reliability', 'overall_rating',
            'title', 'description', 'pros', 'cons', 'helpful_votes',
            'can_edit', 'created_at', 'updated_at'
        ]
        read_only_fields = ['overall_rating', 'helpful_votes', 'created_at', 'updated_at']

    def get_can_edit(self, obj):
        """Check if current user can edit this review"""
        request = self.context.get('request')
        return request and request.user == obj.user

    def validate_model_id(self, value):
        """Validate model exists"""
        try:
            AIModel.objects.get(id=value)
        except AIModel.DoesNotExist:
            raise serializers.ValidationError("AI Model does not exist.")
        return value

    def validate(self, attrs):
        """Validate that user hasn't already reviewed this model"""
        request = self.context.get('request')
        model_id = attrs.get('model_id')

        if request and request.user.is_authenticated and model_id:
            # Check for existing review (only on create, not update)
            if not self.instance:
                existing_review = Review.objects.filter(
                    user=request.user, 
                    model_id=model_id
                ).exists()

                if existing_review:
                    raise serializers.ValidationError(
                        "You have already reviewed this model."
                    )

        return attrs

    def create(self, validated_data):
        """Create review with current user"""
        model_id = validated_data.pop('model_id')
        model = AIModel.objects.get(id=model_id)

        review = Review.objects.create(
            user=self.context['request'].user,
            model=model,
            **validated_data
        )
        return review


class DiscussionListSerializer(serializers.ModelSerializer):
    """Serializer for discussion list view"""
    user = UserMinimalSerializer(read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)

    class Meta:
        model = Discussion
        fields = [
            'id', 'title', 'user', 'model_name', 'likes', 'views',
            'comments_count', 'created_at'
        ]


class DiscussionSerializer(serializers.ModelSerializer):
    """Detailed serializer for discussions"""
    user = UserMinimalSerializer(read_only=True)
    model = AIModelListSerializer(read_only=True)
    model_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Discussion
        fields = [
            'id', 'title', 'content', 'user', 'model', 'model_id',
            'likes', 'views', 'comments_count', 'can_edit',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['likes', 'views', 'comments_count', 'created_at', 'updated_at']

    def get_can_edit(self, obj):
        """Check if current user can edit this discussion"""
        request = self.context.get('request')
        return request and request.user == obj.user

    def create(self, validated_data):
        """Create discussion with current user"""
        model_id = validated_data.pop('model_id', None)
        model = None

        if model_id:
            try:
                model = AIModel.objects.get(id=model_id)
            except AIModel.DoesNotExist:
                pass

        discussion = Discussion.objects.create(
            user=self.context['request'].user,
            model=model,
            **validated_data
        )
        return discussion


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments"""
    user = UserMinimalSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'content', 'likes', 'parent', 'replies',
            'can_edit', 'created_at'
        ]
        read_only_fields = ['likes', 'created_at']

    def get_can_edit(self, obj):
        """Check if current user can edit this comment"""
        request = self.context.get('request')
        return request and request.user == obj.user

    def get_replies(self, obj):
        """Get nested replies"""
        if obj.replies.exists():
            return CommentSerializer(
                obj.replies.all(), 
                many=True, 
                context=self.context
            ).data
        return []


class DiscussionDetailSerializer(DiscussionSerializer):
    """Detailed discussion serializer with comments"""
    comments = serializers.SerializerMethodField()

    class Meta(DiscussionSerializer.Meta):
        fields = DiscussionSerializer.Meta.fields + ['comments']

    def get_comments(self, obj):
        """Get top-level comments for this discussion"""
        top_level_comments = obj.comments.filter(parent__isnull=True).order_by('created_at')
        return CommentSerializer(
            top_level_comments, 
            many=True, 
            context=self.context
        ).data


class ModelCategoryStatsSerializer(serializers.ModelSerializer):
    """Serializer for model category statistics"""
    models_count = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = ModelCategory
        fields = [
            'id', 'name', 'description', 'models_count', 
            'total_reviews', 'average_rating'
        ]

    def get_models_count(self, obj):
        """Get count of models in this category"""
        return obj.models.count()

    def get_total_reviews(self, obj):
        """Get total reviews across all models in this category"""
        return Review.objects.filter(model__category=obj).count()

    def get_average_rating(self, obj):
        """Get average rating across all models in this category"""
        avg = Review.objects.filter(model__category=obj).aggregate(
            avg_rating=Avg('overall_rating')
        )['avg_rating']
        return round(avg, 2) if avg else 0.00


class UserStatsSerializer(serializers.ModelSerializer):
    """Serializer for user statistics"""
    average_rating_given = serializers.SerializerMethodField()
    favorite_categories = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'reviews_count', 'discussions_count',
            'helpful_votes_received', 'average_rating_given', 'favorite_categories'
        ]

    def get_average_rating_given(self, obj):
        """Get average rating given by this user"""
        avg = obj.reviews.aggregate(avg_rating=Avg('overall_rating'))['avg_rating']
        return round(avg, 2) if avg else 0.00

    def get_favorite_categories(self, obj):
        """Get categories this user reviews most"""
        categories = ModelCategory.objects.filter(
            models__reviews__user=obj
        ).annotate(
            review_count=Count('models__reviews')
        ).order_by('-review_count')[:3]

        return ModelCategorySerializer(categories, many=True).data

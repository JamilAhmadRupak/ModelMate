from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from django.contrib.auth.models import AbstractUser
from django.db.models import Avg
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

# ------------------------------
# Validators and Utilities
# ------------------------------

def validate_image_file_size(value):
    """Validate uploaded image file size (max 5MB)"""
    filesize = value.size
    if filesize > 5 * 1024 * 1024:  # 5MB
        raise ValidationError("Maximum file size is 5MB")


# ------------------------------
# Abstract Base Model
# ------------------------------

class TimestampedModel(models.Model):
    """Abstract base model for created_at and updated_at timestamps"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ------------------------------
# User Model
# ------------------------------

class User(AbstractUser, TimestampedModel):
    """Custom User model extending Django's AbstractUser"""
    bio = models.TextField(blank=True, help_text="Brief description about yourself")
    location = models.CharField(max_length=255, blank=True)
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])
        ]
    )
    website = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    expertise_areas = models.TextField(blank=True, help_text="Areas of expertise")

    # Statistics - updated via signals
    reviews_count = models.PositiveIntegerField(default=0, db_index=True)
    discussions_count = models.PositiveIntegerField(default=0, db_index=True)
    helpful_votes_received = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['-reviews_count']),
        ]

    def __str__(self):
        return self.username

    @property
    def full_name_or_username(self):
        return self.get_full_name() or self.username


class ModelCategory(TimestampedModel):
    """AI Model Categories (NLP, Computer Vision, etc.)"""
    name = models.CharField(max_length=255, unique=True, db_index=True)
    description = models.TextField(null=True, blank=True)
    slug = models.SlugField(unique=True, db_index=True)

    class Meta:
        verbose_name_plural = "Model Categories"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return self.name

    @property
    def models_count(self):
        return self.models.count()


class AIModel(models.Model):
    """AI Model information"""
    name = models.CharField(max_length=255, db_index=True)
    creator = models.CharField(max_length=255, db_index=True)
    version = models.CharField(max_length=255, blank=True)
    category = models.ForeignKey(ModelCategory, on_delete=models.SET_NULL, null=True, related_name='models')
    description = models.TextField(null=True, blank=True)
    url = models.URLField(null=True, blank=True)
    release_date = models.DateField(null=True, blank=True, db_index=True)
    size = models.CharField(max_length=100, blank=True)
    architecture = models.CharField(max_length=100, blank=True)
    license = models.CharField(max_length=100, blank=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, db_index=True)
    reviews_count = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        unique_together = [('name', 'creator')]
        ordering = ['-average_rating', 'name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['creator']),
            models.Index(fields=['-average_rating']),
            models.Index(fields=['-release_date']),
            models.Index(fields=['category', '-average_rating']),
        ]

    def __str__(self):
        return f"{self.name}{' v'+self.version if self.version else ''}"


class Review(TimestampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    model = models.ForeignKey(AIModel, on_delete=models.CASCADE, related_name='reviews')
    accuracy = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    speed = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    cost_efficiency = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    ease_of_use = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    reliability = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    overall_rating = models.FloatField(validators=[MinValueValidator(1), MaxValueValidator(5)], editable=False, db_index=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    pros = models.TextField(blank=True)
    cons = models.TextField(blank=True)
    helpful_votes = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        unique_together = [('user', 'model')]
        ordering = ['-created_at']

    def calculate_overall_rating(self):
        return (self.accuracy + self.speed + self.cost_efficiency + self.ease_of_use + self.reliability)/5

    def save(self, *args, **kwargs):
        self.overall_rating = self.calculate_overall_rating()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username}'s review of {self.model.name}"


class Discussion(TimestampedModel):
    title = models.CharField(max_length=200, db_index=True)
    content = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='discussions')
    model = models.ForeignKey(AIModel, on_delete=models.CASCADE, related_name='discussions', null=True, blank=True)
    likes = models.PositiveIntegerField(default=0, db_index=True)
    views = models.PositiveIntegerField(default=0, db_index=True)
    comments_count = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class Comment(TimestampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    likes = models.PositiveIntegerField(default=0, db_index=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on '{self.discussion.title}'"


@receiver([post_save, post_delete], sender=Review)
def update_model_stats(sender, instance, **kwargs):
    model = instance.model
    reviews = model.reviews.all()
    model.average_rating = round(reviews.aggregate(Avg('overall_rating'))['overall_rating__avg'] or 0, 2)
    model.reviews_count = reviews.count()
    model.save(update_fields=['average_rating', 'reviews_count'])

@receiver([post_save, post_delete], sender=Review)
def update_user_reviews(sender, instance, **kwargs):
    user = instance.user
    user.reviews_count = user.reviews.count()
    user.save(update_fields=['reviews_count'])

@receiver([post_save, post_delete], sender=Discussion)
def update_user_discussions(sender, instance, **kwargs):
    user = instance.user
    user.discussions_count = user.discussions.count()
    user.save(update_fields=['discussions_count'])

@receiver([post_save, post_delete], sender=Comment)
def update_discussion_comments(sender, instance, **kwargs):
    discussion = instance.discussion
    discussion.comments_count = discussion.comments.count()
    discussion.save(update_fields=['comments_count'])
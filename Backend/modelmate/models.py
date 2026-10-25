import datetime

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from django.contrib.auth.models import AbstractUser
from django.db.models import Avg
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone

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
    """AI Model information. Each released version is its own row, linked via `predecessor`."""
    KIND_CHOICES = [
        ('model', 'Model / API'),
        ('app', 'App / Product'),
    ]

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

    # Buyer's-guide fields (filled by the catalog sync where possible)
    kind = models.CharField(max_length=10, choices=KIND_CHOICES, default='model')
    family = models.CharField(max_length=100, blank=True, db_index=True, help_text="Groups versions, e.g. 'Claude', 'Gemini'")
    predecessor = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='successors')
    external_id = models.CharField(max_length=255, unique=True, null=True, blank=True, help_text="ID in the synced catalog, e.g. OpenRouter 'vendor/model'")
    context_length = models.PositiveIntegerField(null=True, blank=True)
    input_price_per_mtok = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, help_text="USD per million input tokens")
    output_price_per_mtok = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, help_text="USD per million output tokens")
    has_free_tier = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True, help_text="False once retired by the provider")
    first_seen_at = models.DateTimeField(default=timezone.now, db_index=True)

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


class Task(TimestampedModel):
    """Something a person wants to get done with AI, e.g. 'Summarize long PDFs'. The core page of the guide."""
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(ModelCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    language = models.CharField(max_length=10, default='en', db_index=True, help_text="ISO 639-1 code, e.g. 'en', 'bn'")
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class TaskPrompt(TimestampedModel):
    """Fixed test prompt for a task. New models are run on these so they can be compared quickly."""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='prompts')
    prompt = models.TextField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.task.name}: {self.prompt[:50]}"


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

    # Evidence: what the model was used for, when, and what it produced
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    tested_on = models.DateField(default=datetime.date.today, db_index=True)
    prompt = models.TextField(blank=True)
    output = models.TextField(blank=True)

    class Meta:
        unique_together = [('user', 'model', 'task')]
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


class Comparison(TimestampedModel):
    """Blind head-to-head: two models answer the same prompt, a person picks the better one."""
    VOTE_CHOICES = [
        ('a', 'A is better'),
        ('b', 'B is better'),
        ('tie', 'Tie'),
        ('both_bad', 'Both bad'),
    ]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comparisons')
    task_prompt = models.ForeignKey(TaskPrompt, on_delete=models.SET_NULL, null=True, blank=True, related_name='comparisons')
    prompt = models.TextField()
    model_a = models.ForeignKey(AIModel, on_delete=models.CASCADE, related_name='+')
    model_b = models.ForeignKey(AIModel, on_delete=models.CASCADE, related_name='+')
    output_a = models.TextField()
    output_b = models.TextField()
    vote = models.CharField(max_length=10, choices=VOTE_CHOICES, blank=True)
    voter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='comparisons')
    voted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=['task', 'voted_at'])]
        constraints = [
            models.CheckConstraint(condition=~models.Q(model_a=models.F('model_b')), name='comparison_distinct_models'),
        ]

    def __str__(self):
        return f"{self.model_a} vs {self.model_b} ({self.task})"


class PriceChange(models.Model):
    """Recorded by the catalog sync whenever a model's API price changes."""
    model = models.ForeignKey(AIModel, on_delete=models.CASCADE, related_name='price_changes')
    changed_at = models.DateTimeField(default=timezone.now, db_index=True)
    old_input_price_per_mtok = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    old_output_price_per_mtok = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    new_input_price_per_mtok = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    new_output_price_per_mtok = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)

    class Meta:
        ordering = ['-changed_at']

    def __str__(self):
        return f"{self.model} price change ({self.changed_at:%Y-%m-%d})"


class TaskRanking(models.Model):
    """Daily snapshot of a task leaderboard. History powers 'what changed' and rank-over-time charts."""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='rankings')
    model = models.ForeignKey(AIModel, on_delete=models.CASCADE, related_name='task_rankings')
    date = models.DateField(db_index=True)
    rank = models.PositiveIntegerField(null=True, blank=True, help_text="Null while provisional (not enough recent votes)")
    score = models.FloatField()
    effective_votes = models.FloatField(help_text="Time-decayed vote count")
    recent_votes = models.PositiveIntegerField(help_text="Raw votes in the recent window")
    win_rate = models.FloatField()
    is_provisional = models.BooleanField(default=False)

    class Meta:
        unique_together = [('task', 'model', 'date')]
        ordering = ['task', '-date', 'rank']

    def __str__(self):
        return f"{self.task} #{self.rank or '?'} {self.model} ({self.date})"


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
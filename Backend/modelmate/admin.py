from django.contrib import admin

from .models import (
    User, ModelCategory, AIModel, Review, Discussion, Comment,
    Task, TaskPrompt, Comparison, TaskRanking,
)

admin.site.register([User, ModelCategory, Discussion, Comment])


@admin.register(AIModel)
class AIModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'creator', 'kind', 'family', 'has_free_tier', 'is_active', 'first_seen_at']
    list_filter = ['kind', 'is_active', 'has_free_tier', 'category']
    search_fields = ['name', 'creator', 'family', 'external_id']


class TaskPromptInline(admin.TabularInline):
    model = TaskPrompt
    extra = 1


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['name', 'language', 'category', 'is_featured']
    list_filter = ['language', 'is_featured', 'category']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ['name']}
    inlines = [TaskPromptInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'model', 'task', 'overall_rating', 'tested_on']
    list_filter = ['task', 'tested_on']


@admin.register(Comparison)
class ComparisonAdmin(admin.ModelAdmin):
    list_display = ['task', 'model_a', 'model_b', 'vote', 'voter', 'voted_at']
    list_filter = ['task', 'vote']


@admin.register(TaskRanking)
class TaskRankingAdmin(admin.ModelAdmin):
    list_display = ['task', 'date', 'rank', 'model', 'score', 'effective_votes', 'is_provisional']
    list_filter = ['task', 'date', 'is_provisional']

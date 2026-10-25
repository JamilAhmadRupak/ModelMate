from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from .models import User, ModelCategory, AIModel, Review, Discussion, Comment, Task, TaskRanking
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, ChangePasswordSerializer,
    UserSerializer, UserStatsSerializer,
    ModelCategorySerializer, ModelCategoryStatsSerializer,
    AIModelListSerializer, AIModelSerializer,
    ReviewListSerializer, ReviewSerializer,
    DiscussionListSerializer, DiscussionSerializer, DiscussionDetailSerializer,
    CommentSerializer,
    TaskListSerializer, TaskDetailSerializer
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Discussion, Review, AIModel, ModelCategory
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

@api_view(['GET'])
def community_stats(request):
    return Response({
        'active_members': User.objects.filter(is_active=True).count(),
        'discussions': Discussion.objects.count(),
        'helpful_responses': Review.objects.count(),
    })

@api_view(['GET'])
def popular_tags(request):
    # For demo, return most common category names as tags
    tags = ModelCategory.objects.annotate(num_models=Count('models')).order_by('-num_models')[:10]
    return Response([c.name for c in tags])

@api_view(['GET'])
def leaderboard(request):
    # For demo, return top models by average rating and review count
    models = AIModel.objects.annotate(
        avg_rating=Avg('reviews__overall_rating'),
        review_count=Count('reviews'),
        discussion_count=Count('discussions')
    ).order_by('-avg_rating', '-review_count')[:20]
    data = [
        {
            'id': m.id,
            'name': m.name,
            'creator': m.creator,
            'category': m.category.name if m.category else None,
            'rating': round(m.avg_rating or 0, 2),
            'reviews': m.review_count,
            'discussions': m.discussion_count,
        }
        for m in models
    ]
    return Response({'results': data})


# ------------------------------
# Authentication Views
# ------------------------------

class RegisterView(generics.CreateAPIView):
    """User registration"""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer


# views.py
# class LoginView(APIView):
#     permission_classes = [permissions.AllowAny]

#     def post(self, request, *args, **kwargs):
#         serializer = UserLoginSerializer(data=request.data, context={'request': request})
#         serializer.is_valid(raise_exception=True)
#         user = serializer.validated_data['user']
#         token, created = Token.objects.get_or_create(user=user)
        
#         return Response({'token': token.key}, status=status.HTTP_200_OK)



class ChangePasswordView(generics.UpdateAPIView):
    """Change user password"""
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, queryset=None):
        return self.request.user


# ------------------------------
# User Views
# ------------------------------

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
        })

# class CurrentUserView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         serializer = UserSerializer(request.user)
#         return Response(serializer.data)

class UserDetailView(generics.RetrieveAPIView):
    """Retrieve user details"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'username'


class UserStatsView(generics.RetrieveAPIView):
    """Retrieve user statistics"""
    queryset = User.objects.all()
    serializer_class = UserStatsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'username'


# ------------------------------
# Model Category Views
# ------------------------------

class ModelCategoryListView(generics.ListCreateAPIView):
    queryset = ModelCategory.objects.all()
    serializer_class = ModelCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter] #enables searching through the categories
    search_fields = ['name', 'description'] #a request to /api/categories/?search=vision will return categories where "vision" appears in the name or description


class ModelCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ModelCategory.objects.all()
    serializer_class = ModelCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ModelCategoryStatsView(generics.RetrieveAPIView):
    queryset = ModelCategory.objects.all()
    serializer_class = ModelCategoryStatsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ------------------------------
# AI Model Views
# ------------------------------

class AIModelListView(generics.ListCreateAPIView):
    """Filters: ?active=true, ?free=true, ?kind=model|app. Sort e.g. ?ordering=-first_seen_at or input_price_per_mtok."""
    serializer_class = AIModelListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'creator', 'description', 'architecture']
    ordering_fields = [
        'average_rating', 'reviews_count', 'release_date',
        'first_seen_at', 'input_price_per_mtok', 'output_price_per_mtok', 'context_length',
    ]

    def get_queryset(self):
        qs = AIModel.objects.select_related('category')
        params = self.request.query_params
        if params.get('active') == 'true':
            qs = qs.filter(is_active=True)
        if params.get('free') == 'true':
            qs = qs.filter(has_free_tier=True)
        if params.get('kind'):
            qs = qs.filter(kind=params['kind'])
        return qs

    def perform_create(self, serializer):
        serializer.save()


class AIModelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AIModel.objects.all().select_related('category')
    serializer_class = AIModelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ------------------------------
# Review Views
# ------------------------------

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        model_id = self.kwargs.get('model_id')
        if model_id:
            return Review.objects.filter(model_id=model_id).select_related('user', 'model')
        return Review.objects.all().select_related('user', 'model')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all().select_related('user', 'model')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        if self.request.user != serializer.instance.user:
            raise permissions.PermissionDenied('You cannot edit this review.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.user:
            raise permissions.PermissionDenied('You cannot delete this review.')
        instance.delete()


# ------------------------------
# Discussion Views
# ------------------------------

class DiscussionListCreateView(generics.ListCreateAPIView):
    serializer_class = DiscussionListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        model_id = self.kwargs.get('model_id')
        if model_id:
            return Discussion.objects.filter(model_id=model_id).select_related('user', 'model')
        return Discussion.objects.all().select_related('user', 'model')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DiscussionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Discussion.objects.all().select_related('user', 'model')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return DiscussionDetailSerializer
        return DiscussionSerializer

    def perform_update(self, serializer):
        if self.request.user != serializer.instance.user:
            raise permissions.PermissionDenied('You cannot edit this discussion.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.user:
            raise permissions.PermissionDenied('You cannot delete this discussion.')
        instance.delete()


# ------------------------------
# Comment Views
# ------------------------------

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        discussion_id = self.kwargs.get('discussion_id')
        return Comment.objects.filter(discussion_id=discussion_id).select_related('user', 'discussion')

    def perform_create(self, serializer):
        discussion = get_object_or_404(Discussion, id=self.kwargs.get('discussion_id'))
        serializer.save(user=self.request.user, discussion=discussion)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all().select_related('user', 'discussion')
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        if self.request.user != serializer.instance.user:
            raise permissions.PermissionDenied('You cannot edit this comment.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.user:
            raise permissions.PermissionDenied('You cannot delete this comment.')
        instance.delete()


# ------------------------------
# Buyer's guide: tasks & rankings
# ------------------------------

class TaskListView(generics.ListAPIView):
    """Tasks people want to do. Filter with ?language=bn, ?featured=true, ?search=..."""
    serializer_class = TaskListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_queryset(self):
        qs = Task.objects.select_related('category')
        language = self.request.query_params.get('language')
        if language:
            qs = qs.filter(language=language)
        if self.request.query_params.get('featured') == 'true':
            qs = qs.filter(is_featured=True)
        return qs


class TaskDetailView(generics.RetrieveAPIView):
    queryset = Task.objects.select_related('category')
    serializer_class = TaskDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


@api_view(['GET'])
def task_ranking_history(request, slug):
    """Rank over time for a task: [{date, model_id, model_name, rank, score}], default last 90 days."""
    task = get_object_or_404(Task, slug=slug)
    try:
        days = min(int(request.query_params.get('days', 90)), 365)
    except ValueError:
        days = 90
    since = timezone.localdate() - timedelta(days=days)
    rows = (
        TaskRanking.objects.filter(task=task, date__gte=since, rank__isnull=False)
        .order_by('date', 'rank')
        .values('date', 'model_id', 'model__name', 'rank', 'score')
    )
    return Response([
        {'date': r['date'], 'model_id': r['model_id'], 'model_name': r['model__name'],
         'rank': r['rank'], 'score': r['score']}
        for r in rows
    ])

from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from .models import User, ModelCategory, AIModel, Review, Discussion, Comment
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, ChangePasswordSerializer,
    UserSerializer, UserStatsSerializer,
    ModelCategorySerializer, ModelCategoryStatsSerializer,
    AIModelListSerializer, AIModelSerializer,
    ReviewListSerializer, ReviewSerializer,
    DiscussionListSerializer, DiscussionSerializer, DiscussionDetailSerializer,
    CommentSerializer
)


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
    queryset = AIModel.objects.all()
    serializer_class = AIModelListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'creator', 'description', 'architecture']
    ordering_fields = ['average_rating', 'reviews_count', 'release_date']

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

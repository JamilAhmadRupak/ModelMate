from django.urls import path, include
from rest_framework.urlpatterns import format_suffix_patterns
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    # ------------------------------
    # Authentication URLs
    # ------------------------------
    path('auth/register/', views.RegisterView.as_view(), name='register'),    
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    #with jwt authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # ------------------------------
    # User URLs
    # ------------------------------
    path('users/me/', views.CurrentUserView.as_view(), name='current-user'),
    path('users/<str:username>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<str:username>/stats/', views.UserStatsView.as_view(), name='user-stats'),

    # ------------------------------
    # Model Category URLs
    # ------------------------------
    path('categories/', views.ModelCategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.ModelCategoryDetailView.as_view(), name='category-detail'),
    path('categories/<int:pk>/stats/', views.ModelCategoryStatsView.as_view(), name='category-stats'),

    # ------------------------------
    # AI Model URLs
    # ------------------------------
    path('models/', views.AIModelListView.as_view(), name='model-list'),
    path('models/<int:pk>/', views.AIModelDetailView.as_view(), name='model-detail'),

    # ------------------------------
    # Review URLs
    # ------------------------------
    # List all reviews or create a new review for a specific model
    path('models/<int:model_id>/reviews/', views.ReviewListCreateView.as_view(), name='model-review-list'),
    # Retrieve, update or delete a specific review
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),

    # ------------------------------
    # Discussion URLs
    # ------------------------------
    # List all discussions or create a new discussion for a specific model
    path('models/<int:model_id>/discussions/', views.DiscussionListCreateView.as_view(), name='model-discussion-list'),
    # Retrieve, update or delete a specific discussion
    path('discussions/<int:pk>/', views.DiscussionDetailView.as_view(), name='discussion-detail'),
    path('discussions/', views.DiscussionListCreateView.as_view(), name='discussion-list'),

    # ------------------------------
    # Comment URLs
    # ------------------------------
    # List all comments or create a new comment for a specific discussion
    path('discussions/<int:discussion_id>/comments/', views.CommentListCreateView.as_view(), name='discussion-comment-list'),
    # Retrieve, update or delete a specific comment
    path('comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
]

# Adds support for format suffixes to the URLs (e.g., .json, .api)
urlpatterns = format_suffix_patterns(urlpatterns)

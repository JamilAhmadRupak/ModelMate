from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, ModelCategory, AIModel, Review, Discussion, Comment
from django.utils.text import slugify
import datetime

class ModelCreationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.category = ModelCategory.objects.create(  # type: ignore
            name='NLP',
            description='Natural Language Processing',
            slug=slugify('NLP')
        )
        self.model = AIModel.objects.create(  # type: ignore
            name='BERT',
            creator='Google',
            version='1.0',
            category=self.category,
            description='Transformer model',
            url='https://github.com/google-research/bert',
            release_date=datetime.date(2018, 10, 1),
            size='400MB',
            architecture='Transformer',
            license='Apache 2.0'
        )

    def test_user_creation(self):
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(self.user.username, 'testuser')

    def test_category_creation(self):
        self.assertEqual(ModelCategory.objects.count(), 1)  # type: ignore
        self.assertEqual(self.category.name, 'NLP')

    def test_model_creation(self):
        self.assertEqual(AIModel.objects.count(), 1)  # type: ignore
        self.assertEqual(self.model.name, 'BERT')
        self.assertEqual(self.model.category, self.category)

    def test_review_creation_and_overall_rating(self):
        review = Review.objects.create(  # type: ignore
            user=self.user,
            model=self.model,
            accuracy=5,
            speed=4,
            cost_efficiency=3,
            ease_of_use=4,
            reliability=5,
            title='Great model',
            description='Very useful',
            pros='Accurate',
            cons='Large size'
        )
        self.assertEqual(Review.objects.count(), 1)  # type: ignore
        self.assertAlmostEqual(review.overall_rating, 4.2)

    def test_discussion_and_comment_creation(self):
        discussion = Discussion.objects.create(  # type: ignore
            title='How to fine-tune?',
            content='Any tips?',
            user=self.user,
            model=self.model
        )
        comment = Comment.objects.create(  # type: ignore
            user=self.user,
            discussion=discussion,
            content='Try using smaller learning rates.'
        )
        self.assertEqual(Discussion.objects.count(), 1)  # type: ignore
        self.assertEqual(Comment.objects.count(), 1)  # type: ignore
        self.assertEqual(comment.discussion, discussion)

class APITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'apitestuser',
            'email': 'api@example.com',
            'first_name': 'API',
            'last_name': 'User',
            'password': 'apipass123',
            'password_confirm': 'apipass123'
        }
        self.category = ModelCategory.objects.create(  # type: ignore
            name='Vision',
            description='Computer Vision',
            slug=slugify('Vision')
        )
        self.model = AIModel.objects.create(  # type: ignore
            name='ResNet',
            creator='Microsoft',
            version='2.0',
            category=self.category,
            description='CNN model',
            url='https://github.com/microsoft/resnet',
            release_date=datetime.date(2015, 6, 1),
            size='200MB',
            architecture='CNN',
            license='MIT'
        )
        self.user = User.objects.create_user(
            username='apiuser',
            email='apiuser@example.com',
            password='apipass123',
            first_name='API',
            last_name='User'
        )

    def authenticate(self):
        response = self.client.post(reverse('login'), {'username': 'apiuser', 'password': 'apipass123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token = response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

    def test_user_registration(self):
        response = self.client.post(reverse('register'), self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)  # type: ignore
        self.assertIn('token', response.data)  # type: ignore

    def test_user_login(self):
        response = self.client.post(reverse('login'), {'username': 'apiuser', 'password': 'apipass123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # type: ignore
        self.assertIn('token', response.data)  # type: ignore

    def test_category_list_and_create(self):
        self.authenticate()
        response = self.client.get(reverse('category-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # type: ignore
        data = {'name': 'Audio', 'description': 'Audio models', 'slug': 'audio'}
        response = self.client.post(reverse('category-list'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)  # type: ignore

    def test_model_list_and_create(self):
        self.authenticate()
        response = self.client.get(reverse('model-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # type: ignore
        data = {
            'name': 'GPT-3',
            'creator': 'OpenAI',
            'version': '3.0',
            'category_id': self.category.id,
            'description': 'Large language model',
            'url': 'https://openai.com/gpt-3',
            'release_date': '2020-06-01',
            'size': '175B',
            'architecture': 'Transformer',
            'license': 'OpenAI'
        }
        response = self.client.post(reverse('model-list'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)  # type: ignore

    def test_review_crud(self):
        self.authenticate()
        # Create review
        data = {
            'model_id': self.model.id,
            'accuracy': 5,
            'speed': 4,
            'cost_efficiency': 4,
            'ease_of_use': 5,
            'reliability': 5,
            'title': 'Excellent',
            'description': 'Fast and accurate',
            'pros': 'Speed',
            'cons': 'None'
        }
        response = self.client.post(reverse('model-review-list', args=[self.model.id]), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)  # type: ignore
        review_id = response.data['id']  # type: ignore
        # Get review
        response = self.client.get(reverse('review-detail', args=[review_id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # type: ignore
        # Update review
        update_data = {'title': 'Updated', 'description': 'Updated desc', 'accuracy': 4, 'speed': 4, 'cost_efficiency': 4, 'ease_of_use': 4, 'reliability': 4}
        response = self.client.patch(reverse('review-detail', args=[review_id]), update_data)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_202_ACCEPTED])  # type: ignore
        # Delete review
        response = self.client.delete(reverse('review-detail', args=[review_id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)  # type: ignore

    def test_discussion_crud(self):
        self.authenticate()
        # Create discussion
        data = {'title': 'API Discussion', 'content': 'Let us discuss', 'model_id': self.model.id}
        response = self.client.post(reverse('model-discussion-list', args=[self.model.id]), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)  # type: ignore
        discussion_id = response.data['id']  # type: ignore
        # Get discussion
        response = self.client.get(reverse('discussion-detail', args=[discussion_id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # type: ignore
        # Update discussion
        update_data = {'title': 'Updated Discussion', 'content': 'Updated content'}
        response = self.client.patch(reverse('discussion-detail', args=[discussion_id]), update_data)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_202_ACCEPTED])  # type: ignore
        # Delete discussion
        response = self.client.delete(reverse('discussion-detail', args=[discussion_id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)  # type: ignore

    def test_comment_crud(self):
        self.authenticate()
        # Create discussion first
        discussion = Discussion.objects.create(title='Comment Discussion', content='Discuss here', user=self.user, model=self.model)  # type: ignore
        # Create comment
        data = {'content': 'Nice post!'}
        response = self.client.post(reverse('discussion-comment-list', args=[discussion.id]), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)  # type: ignore
        comment_id = response.data['id']  # type: ignore
        # Get comment
        response = self.client.get(reverse('comment-detail', args=[comment_id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)  # type: ignore
        # Update comment
        update_data = {'content': 'Updated comment'}
        response = self.client.patch(reverse('comment-detail', args=[comment_id]), update_data)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_202_ACCEPTED])  # type: ignore
        # Delete comment
        response = self.client.delete(reverse('comment-detail', args=[comment_id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)  # type: ignore

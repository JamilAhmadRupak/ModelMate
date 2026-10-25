import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from modelmate.models import ModelCategory, AIModel, Discussion, Review, Comment
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with dummy data for development.'

    def handle(self, *args, **kwargs):
        # Create users
        users = []
        for username in ['alice', 'bob', 'charlie', 'dave', 'eve']:
            user, _ = User.objects.get_or_create(username=username, defaults={
                'email': f'{username}@example.com',
                'password': 'pbkdf2_sha256$260000$demo$3g7uIv3ZtQHUG8B2h8lRcadq+X5Gv2K0h2rI1r1+h48=',
                'is_active': True
            })
            users.append(user)
        self.stdout.write(self.style.SUCCESS(f'Created {len(users)} users.'))

        # Create categories
        categories = []
        category_names = [
            ('Natural Language Processing', 'Text understanding & generation'),
            ('Computer Vision', 'Image analysis and understanding'),
            ('Speech', 'Speech recognition and synthesis'),
            ('Recommendation Systems', 'Personalized suggestions'),
            ('Generative AI', 'Models generating text/data/images'),
        ]
        for name, desc in category_names:
            cat, _ = ModelCategory.objects.get_or_create(name=name, defaults={
                'description': desc,
                'slug': name.lower().replace(' ', '-')
            })
            categories.append(cat)
        self.stdout.write(self.style.SUCCESS(f'Created {len(categories)} categories.'))

        # Create models
        models = []
        for i in range(10):
            model, _ = AIModel.objects.get_or_create(
                name=f'Model {i+1}',
                creator=random.choice(users).username,
                defaults={
                    'category': random.choice(categories),
                    'version': f'v{random.randint(1,3)}.0',
                    'description': f'Description for Model {i+1}',
                    'size': f'{random.randint(100, 1000)}M',
                    'architecture': random.choice(['Transformer', 'CNN', 'RNN']),
                    'license': random.choice(['Apache 2.0', 'MIT', 'GPL-3.0']),
                    'release_date': timezone.now().date(),
                }
            )
            models.append(model)
        self.stdout.write(self.style.SUCCESS(f'Created {len(models)} models.'))

        # Create discussions
        discussions = []
        for i in range(15):
            discussion, _ = Discussion.objects.get_or_create(
                title=f'Discussion {i+1}',
                user=random.choice(users),
                defaults={
                    'content': f'This is the content of discussion {i+1}.',
                    'model': random.choice(models),
                    'likes': random.randint(0, 20),
                    'views': random.randint(0, 100),
                }
            )
            discussions.append(discussion)
        self.stdout.write(self.style.SUCCESS(f'Created {len(discussions)} discussions.'))

        # Create reviews
        reviews = []
        for i in range(20):
            review, _ = Review.objects.get_or_create(
                user=random.choice(users),
                model=random.choice(models),
                defaults={
                    'accuracy': random.randint(3, 5),
                    'speed': random.randint(3, 5),
                    'cost_efficiency': random.randint(3, 5),
                    'ease_of_use': random.randint(3, 5),
                    'reliability': random.randint(3, 5),
                    'title': f'Review {i+1}',
                    'description': f'This is the review text for review {i+1}.',
                    'pros': 'Good performance',
                    'cons': 'Some limitations',
                }
            )
            reviews.append(review)
        self.stdout.write(self.style.SUCCESS(f'Created {len(reviews)} reviews.'))

        # Create comments
        for i in range(30):
            Comment.objects.get_or_create(
                user=random.choice(users),
                discussion=random.choice(discussions),
                defaults={
                    'content': f'This is comment {i+1}.',
                    'likes': random.randint(0, 10),
                }
            )
        self.stdout.write(self.style.SUCCESS('Created 30 comments.'))

        self.stdout.write(self.style.SUCCESS('Dummy data seeding complete!')) 
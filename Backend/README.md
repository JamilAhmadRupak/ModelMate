# ModelMate Backend

This is the backend for the ModelMate AI Model Review System, built with Django and Django REST Framework.

## Features
- AI Model catalog and details
- Model reviews, ratings, and discussions
- Nested comments on discussions
- User authentication and permissions
- PostgreSQL database support

## Getting Started

### Prerequisites
- Python 3.10+
- PostgreSQL
- pip (Python package manager)

### Setup
1. **Clone the repository**
2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure environment variables**
   - Edit `.env` in `ModelMate/Backend/` with your database and secret key settings.
4. **Apply migrations**
   ```bash
   python manage.py migrate
   ```
5. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```
6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

## Project Structure
```
ModelMate/
  Backend/
    manage.py
    Backend/
      settings.py
      urls.py
      ...
    modelmate/
      models.py
      views.py
      serializers.py
      urls.py
      ...
```

## API Endpoints
- `/models/` — List and create AI models
- `/models/<id>/` — Retrieve, update, or delete a model
- `/models/<model_id>/reviews/` — List and create reviews for a model
- `/reviews/<id>/` — Retrieve, update, or delete a review
- `/models/<model_id>/discussions/` — List and create discussions for a model
- `/discussions/<id>/` — Retrieve, update, or delete a discussion
- `/discussions/<discussion_id>/comments/` — List and create comments for a discussion
- `/comments/<id>/` — Retrieve, update, or delete a comment

## Environment Variables
See `.env` for required variables:
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`

## License
This project is for educational/demo purposes.

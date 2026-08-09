# AGENTS.md

## Project overview
This repository contains a Django + React chat app.

- Backend: Django REST Framework + Channels WebSocket chat server in [backend](backend)
- Frontend: Vite + React app in [frontend](frontend)
- Shared auth flow: JWT-based authentication with Django REST Framework and a custom user model in [backend/accounts/models.py](backend/accounts/models.py)
- Main Django settings: [backend/chat_project/settings.py](backend/chat_project/settings.py)
- Main routes: [backend/chat_project/urls.py](backend/chat_project/urls.py)
- Frontend docs: [frontend/README.md](frontend/README.md)

## Working conventions
- Keep changes small and focused. Do not broaden scope or modify unrelated apps or frontend components.
- Follow the existing Django app boundaries: keep models, serializers, views, and consumer logic in their app folders.
- Prefer simple, readable solutions over clever abstractions.
- Preserve the current JWT auth model and API structure unless the task explicitly requires a redesign.
- For React work, prefer functional components, hooks, and small reusable UI pieces.
- Keep secrets out of source control. This project currently uses a dev-only Django secret and local-only CORS settings, so do not hardcode production credentials.

## Run commands
### Backend
```bash
cd backend
python manage.py migrate
python manage.py check
python manage.py runserver 0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

### Validation
```bash
cd backend
python manage.py check

cd ../frontend
npm run build
npm run lint
```

## Project-specific notes
- The backend uses Django Channels for real-time chat and the consumer logic lives in [backend/chat/consumers.py](backend/chat/consumers.py).
- Authentication is enabled globally for API endpoints by default in [backend/chat_project/settings.py](backend/chat_project/settings.py), so new API views should be explicit about permission classes.
- The frontend is a Vite app and expects the backend API at localhost:8000 with the frontend served on localhost:5173.
- The CORS configuration only allows local frontend origins; keep that behavior consistent when editing network settings.

## When making changes
- Explain the root cause before fixing bugs.
- Prefer the smallest necessary code change and validate with the relevant Django or Vite commands.
- For backend changes, consider serializer validation, user permissions, and chat membership checks before editing logic.
- For frontend changes, keep components readable and avoid unnecessary dependencies or state churn.

## Teaching and mentorship preferences
- Explain important code patterns clearly and simply.
- Call out security, correctness, and maintainability concerns when relevant.
- Recommend the simplest robust approach for the current skill level, and mention better alternatives only when they materially improve the solution.

from django.urls import path
from .views import RegisterView, UserListView, current_user

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', current_user, name='current-user'),
    path('users/', UserListView.as_view(), name='user-list'),
]

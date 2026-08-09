from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    bio = models.TextField(blank=True, default='')
    avatar_color = models.CharField(max_length=20, default='#7c3aed')

    def __str__(self):
        return self.username

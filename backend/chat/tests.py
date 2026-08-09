from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Conversation

User = get_user_model()


class ConversationCreationTests(TestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(username='alice', email='alice@example.com', password='Pass123!')
        self.user_b = User.objects.create_user(username='bob', email='bob@example.com', password='Pass123!')
        self.token = str(RefreshToken.for_user(self.user_a).access_token)

    def test_existing_conversation_is_reused_for_same_user_pair(self):
        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

        first_response = self.client.post(
            '/api/chat/conversations/',
            {'other_user_id': self.user_b.id},
            content_type='application/json',
            **headers,
        )

        second_response = self.client.post(
            '/api/chat/conversations/',
            {'other_user_id': self.user_b.id},
            content_type='application/json',
            **headers,
        )

        self.assertEqual(first_response.status_code, 201)
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(Conversation.objects.filter(participants=self.user_a).filter(participants=self.user_b).count(), 1)

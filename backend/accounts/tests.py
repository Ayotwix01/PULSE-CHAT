from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserProfileUpdateTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='profileuser',
            email='profileuser@example.com',
            password='OldPass123!',
            first_name='Old',
            last_name='Name',
            bio='Initial bio',
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)

    def test_user_can_update_profile_fields_and_password(self):
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {self.token}'

        payload = {
            'username': 'newprofileuser',
            'email': 'newprofileuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'bio': 'Updated bio',
            'avatar_color': '#ff5733',
            'password': 'NewPass456!',
            'password2': 'NewPass456!',
        }

        response = self.client.patch('/api/auth/me/', payload, content_type='application/json')

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'newprofileuser')
        self.assertEqual(self.user.email, 'newprofileuser@example.com')
        self.assertEqual(self.user.first_name, 'New')
        self.assertEqual(self.user.last_name, 'User')
        self.assertEqual(self.user.bio, 'Updated bio')
        self.assertEqual(self.user.avatar_color, '#ff5733')
        self.assertTrue(self.user.check_password('NewPass456!'))

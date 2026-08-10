import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model

from .models import Conversation, Message

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']

        print(
            f"WEBSOCKET CONNECTING | "
            f"user={getattr(self.user, 'username', 'unknown')} | "
            f"conversation={self.scope['url_route']['kwargs'].get('conversation_id')}"
        )

        if not self.user.is_authenticated:
            print("WEBSOCKET REJECTED: unauthenticated")
            await self.close(code=4001)
            return

        self.conversation_id = self.scope['url_route']['kwargs'].get(
            'conversation_id'
        )
        self.room_group_name = f'chat_{self.conversation_id}'

        is_member = await self.is_conversation_member(
            self.conversation_id,
            self.user.id
        )

        if not is_member:
            print("WEBSOCKET REJECTED: user is not conversation member")
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        print("WEBSOCKET ACCEPTED")

    async def disconnect(self, close_code):
        print(
            f"WEBSOCKET DISCONNECTED | "
            f"user={self.user.username} | "
            f"conversation={self.conversation_id} | "
            f"code={close_code}"
        )

        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
        )

    async def receive_json(self, content, **kwargs):
        kind = content.get('kind')

        if kind in {'game_start', 'game_guess'}:
            game_name = content.get('game', 'guess_number')

            if kind == 'game_start':
                if game_name == 'alphabet_sprint':
                    target = str(content.get('target', 'A')).upper()
                    game = {
                        'game': 'alphabet_sprint',
                        'status': 'playing',
                        'started_by': self.user.username,
                        'target': target,
                        'last_hint': 'Guess the hidden letter from A to Z.',
                        'winner': None,
                    }
                else:
                    target = int(content.get('target', 10))
                    game = {
                        'game': 'guess_number',
                        'status': 'playing',
                        'started_by': self.user.username,
                        'target': target,
                        'last_hint': 'Make your first guess between 1 and 20.',
                        'winner': None,
                    }
            else:
                target = content.get('target', 0)
                guess = content.get('guess', '')

                if game_name == 'alphabet_sprint':
                    guess = str(guess).upper()
                    target = str(target).upper()
                    if guess < target:
                        hint = 'Too early in the alphabet. Try a later letter.'
                        status = 'playing'
                        winner = None
                    elif guess > target:
                        hint = 'Too late in the alphabet. Try an earlier letter.'
                        status = 'playing'
                        winner = None
                    else:
                        hint = f'{self.user.username} nailed the letter!'
                        status = 'won'
                        winner = self.user.username
                    game = {
                        'game': 'alphabet_sprint',
                        'status': status,
                        'started_by': content.get('started_by', self.user.username),
                        'target': target,
                        'last_hint': hint,
                        'winner': winner,
                        'guess': guess,
                    }
                else:
                    guess = int(content.get('guess', 0))
                    target = int(content.get('target', 0))
                    if guess < target:
                        hint = 'Too low. Try a higher number.'
                        status = 'playing'
                        winner = None
                    elif guess > target:
                        hint = 'Too high. Try a lower number.'
                        status = 'playing'
                        winner = None
                    else:
                        hint = f'{self.user.username} nailed it!'
                        status = 'won'
                        winner = self.user.username
                    game = {
                        'game': 'guess_number',
                        'status': status,
                        'started_by': content.get('started_by', self.user.username),
                        'target': target,
                        'last_hint': hint,
                        'winner': winner,
                        'guess': guess,
                    }

            payload = {
                'type': 'game_event',
                'conversation_id': self.conversation_id,
                'game': game,
            }
            await self.channel_layer.group_send(self.room_group_name, payload)
            return

        message_text = content.get('message', '').strip()
        if not message_text:
            return

        message = await self.create_message(self.conversation_id, self.user.id, message_text)
        payload = {
            'type': 'chat_message',
            'message': {
                'id': message.id,
                'sender': self.user.username,
                'text': message.text,
                'created_at': message.created_at.isoformat(),
            },
        }

        await self.channel_layer.group_send(self.room_group_name, payload)

    async def chat_message(self, event):
        await self.send_json(event)

    async def game_event(self, event):
        await self.send_json(event)

    @database_sync_to_async
    def is_conversation_member(self, conversation_id, user_id):
        return Conversation.objects.filter(id=conversation_id, participants__id=user_id).exists()

    @database_sync_to_async
    def create_message(self, conversation_id, user_id, text):
        conversation = Conversation.objects.get(id=conversation_id)
        user = User.objects.get(id=user_id)
        return Message.objects.create(conversation=conversation, sender=user, text=text)

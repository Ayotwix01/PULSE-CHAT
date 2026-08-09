from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()


class ConversationListView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).distinct().order_by('-created_at')

    def post(self, request, *args, **kwargs):
        other_user_id = request.data.get('other_user_id')
        if not other_user_id:
            return Response({'detail': 'other_user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        existing_conversation = (
            Conversation.objects.filter(participants=request.user)
            .filter(participants=other_user)
            .distinct()
            .first()
        )

        if existing_conversation:
            serializer = self.get_serializer(existing_conversation)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        other_user_id = self.request.data.get('other_user_id')
        if not other_user_id:
            raise ValueError('other_user_id is required')
        other_user = User.objects.get(id=other_user_id)
        conversation = serializer.save()
        conversation.participants.add(self.request.user, other_user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_message(request):
    conversation_id = request.data.get('conversation_id')
    text = request.data.get('text', '').strip()

    if not conversation_id or not text:
        return Response({'detail': 'conversation_id and text are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conversation = Conversation.objects.get(id=conversation_id, participants=request.user)
    except Conversation.DoesNotExist:
        return Response({'detail': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

    message = Message.objects.create(conversation=conversation, sender=request.user, text=text)
    serializer = MessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def conversation_detail(request, pk):
    conversation = Conversation.objects.filter(id=pk, participants=request.user).first()
    if not conversation:
        return Response({'detail': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ConversationSerializer(conversation)
    return Response(serializer.data)

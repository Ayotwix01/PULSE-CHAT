from django.urls import path
from .views import ConversationListView, conversation_detail, send_message

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversations'),
    path('conversations/<int:pk>/', conversation_detail, name='conversation-detail'),
    path('messages/send/', send_message, name='send-message'),
]

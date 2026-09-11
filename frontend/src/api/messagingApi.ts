import api from "./axios";

export type MessagingParticipantType =
  | "EMPLOYER"
  | "CANDIDATE"
  | "ADMIN"
  | "CHATBOT";

export interface MessagingConversation {
  id: string;
  participantType: MessagingParticipantType;
  participantId: string | null;
  participantName: string;
  participantRole: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface MessagingMessage {
  id: string;
  conversationId: string;
  senderType: MessagingParticipantType;
  senderId: string | null;
  senderName: string;
  text: string;
  createdAt: string;
  readAt: string | null;
}

export interface ConversationMessagesResponse {
  conversation: MessagingConversation;
  messages: MessagingMessage[];
}

export interface CreateConversationRequest {
  targetType: MessagingParticipantType;
  targetId?: string | null;
}

export interface SendMessageRequest {
  text: string;
}


export async function getConversations(): Promise<
  MessagingConversation[]
> {
  const response = await api.get<MessagingConversation[]>(
    "/api/messages/conversations"
  );

  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data;
}


export async function createConversation(
  data: CreateConversationRequest
): Promise<MessagingConversation> {
  const response =
    await api.post<MessagingConversation>(
      "/api/messages/conversations",
      {
        targetType: data.targetType,
        targetId: data.targetId ?? null,
      }
    );

  return response.data;
}


export async function getConversationMessages(
  conversationId: string
): Promise<ConversationMessagesResponse> {
  const response =
    await api.get<ConversationMessagesResponse>(
      `/api/messages/conversations/${conversationId}`
    );

  return response.data;
}


export async function sendConversationMessage(
  conversationId: string,
  data: SendMessageRequest
): Promise<MessagingMessage> {
  const response =
    await api.post<MessagingMessage>(
      `/api/messages/conversations/${conversationId}/messages`,
      data
    );

  return response.data;
}
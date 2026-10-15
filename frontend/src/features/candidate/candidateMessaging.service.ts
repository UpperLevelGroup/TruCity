import api from "../../api/axios";

export interface CandidateConversation {
  id: string;
  participantType: string;
  participantId: string | null;
  participantName: string;
  participantRole: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface CandidateMessage {
  id: string;
  conversationId: string;
  senderType: string;
  senderId: string | null;
  senderName: string;
  text: string;
  createdAt: string;
  readAt: string | null;
}

export interface CandidateConversationMessages {
  conversation: CandidateConversation;
  messages: CandidateMessage[];
}

export interface CreateCandidateConversationRequest {
  targetType: "ADMIN" | "EMPLOYER" | "CHATBOT";
  targetId?: string | null;
}

type ApiObject = Record<string, unknown>;

function isObject(value: unknown): value is ApiObject {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function unwrapResponse(value: unknown): unknown {
  if (!isObject(value)) {
    return value;
  }

  if (isObject(value.conversation)) {
    return value.conversation;
  }

  if (isObject(value.data)) {
    return value.data;
  }

  return value;
}

function normalizeConversation(
  value: unknown
): CandidateConversation {
  const raw = unwrapResponse(value);

  if (!isObject(raw)) {
    throw new Error(
      "The server returned an invalid conversation."
    );
  }

  const id = raw.id ?? raw.conversationId;

  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error(
      "The conversation response is missing its ID."
    );
  }

  return {
    id: String(id),
    participantType: String(raw.participantType ?? ""),
    participantId:
      raw.participantId == null
        ? null
        : String(raw.participantId),
    participantName: String(
      raw.participantName ?? "Conversation"
    ),
    participantRole: String(raw.participantRole ?? ""),
    lastMessage:
      raw.lastMessage == null
        ? null
        : String(raw.lastMessage),
    lastMessageAt:
      raw.lastMessageAt == null
        ? null
        : String(raw.lastMessageAt),
    unreadCount: Math.max(
      0,
      Number(raw.unreadCount ?? 0) || 0
    ),
  };
}

function normalizeMessage(value: unknown): CandidateMessage {
  if (!isObject(value)) {
    throw new Error(
      "The server returned an invalid message."
    );
  }

  const id = value.id ?? value.messageId;
  const conversationId = value.conversationId;
  const text = value.text ?? value.message;

  if (id == null || conversationId == null) {
    throw new Error(
      "The message response is missing its ID or conversation ID."
    );
  }

  return {
    id: String(id),
    conversationId: String(conversationId),
    senderType: String(value.senderType ?? ""),
    senderId:
      value.senderId == null
        ? null
        : String(value.senderId),
    senderName: String(value.senderName ?? "User"),
    text: String(text ?? ""),
    createdAt: String(value.createdAt ?? ""),
    readAt:
      value.readAt == null
        ? null
        : String(value.readAt),
  };
}

function extractApiError(
  error: unknown,
  fallback: string
): string {
  if (!isObject(error)) {
    return fallback;
  }

  const response = isObject(error.response)
    ? error.response
    : undefined;

  const data = response && isObject(response.data)
    ? response.data
    : undefined;

  if (data) {
    const message =
      data.message ??
      data.detail ??
      data.error;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  // Spring may return a plain-text error response.
  if (
    response &&
    typeof response.data === "string" &&
    response.data.trim()
  ) {
    return response.data;
  }

  if (
    isObject(error) &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

export const candidateMessagingService = {
  async getConversations(): Promise<CandidateConversation[]> {
    try {
      const response = await api.get<unknown>(
        "/api/messages/conversations"
      );

      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : isObject(data) && Array.isArray(data.conversations)
          ? data.conversations
          : isObject(data) && Array.isArray(data.data)
            ? data.data
            : null;

      if (!list) {
        throw new Error(
          "The server returned an invalid conversations list."
        );
      }

      return list.map(normalizeConversation);
    } catch (error) {
      console.error(
        "Failed to load candidate conversations:",
        error
      );

      throw new Error(
        extractApiError(
          error,
          "Unable to load conversations. Please try again."
        )
      );
    }
  },

  async createConversation(
    request: CreateCandidateConversationRequest
  ): Promise<CandidateConversation> {
    try {
      const targetType = String(
        request.targetType ?? ""
      ).toUpperCase();

      if (
        targetType !== "ADMIN" &&
        targetType !== "EMPLOYER" &&
        targetType !== "CHATBOT"
      ) {
        throw new Error(
          "The requested conversation type is invalid."
        );
      }

      // Candidate initiation permissions are enforced by the backend.
      // An ADMIN conversation can be created without an admin UUID.
      const response = await api.post<unknown>(
        "/api/messages/conversations",
        {
          targetType,
          targetId: request.targetId ?? null,
        }
      );

      return normalizeConversation(response.data);
    } catch (error) {
      console.error(
        "Failed to create candidate conversation:",
        error
      );

      throw new Error(
        extractApiError(
          error,
          "Unable to start the conversation. Please try again."
        )
      );
    }
  },

  async createAdminConversation(): Promise<CandidateConversation> {
    return candidateMessagingService.createConversation({
      targetType: "ADMIN",
      targetId: null,
    });
  },

  async getMessages(
    conversationId: string
  ): Promise<CandidateConversationMessages> {
    try {
      const id = String(conversationId ?? "").trim();

      if (!id) {
        throw new Error(
          "A conversation ID is required to load messages."
        );
      }

      const response = await api.get<unknown>(
        `/api/messages/conversations/${encodeURIComponent(id)}`
      );

      const raw = response.data;

      if (!isObject(raw)) {
        throw new Error(
          "The server returned an invalid conversation thread."
        );
      }

      const conversation = normalizeConversation(
        raw.conversation ?? raw
      );

      const messageList = Array.isArray(raw.messages)
        ? raw.messages
        : Array.isArray(raw.data)
          ? raw.data
          : null;

      if (!messageList) {
        throw new Error(
          "The server response does not contain a messages list."
        );
      }

      return {
        conversation,
        messages: messageList.map(normalizeMessage),
      };
    } catch (error) {
      console.error(
        "Failed to load conversation messages:",
        error
      );

      throw new Error(
        extractApiError(
          error,
          "Unable to load messages. Please try again."
        )
      );
    }
  },

  async sendMessage(
    conversationId: string,
    text: string
  ): Promise<CandidateMessage> {
    try {
      const id = String(conversationId ?? "").trim();
      const cleanedText = String(text ?? "").trim();

      if (!id) {
        throw new Error(
          "Select a conversation before sending a message."
        );
      }

      if (!cleanedText) {
        throw new Error(
          "Enter a message before sending."
        );
      }

      if (cleanedText.length > 5000) {
        throw new Error(
          "Messages cannot exceed 5000 characters."
        );
      }

      const response = await api.post<unknown>(
        `/api/messages/conversations/${encodeURIComponent(id)}/messages`,
        { text: cleanedText }
      );

      return normalizeMessage(response.data);
    } catch (error) {
      console.error(
        "Failed to send candidate message:",
        error
      );

      throw new Error(
        extractApiError(
          error,
          "Your message could not be sent. Please try again."
        )
      );
    }
  },

  async markConversationRead(
    conversationId: string
  ): Promise<void> {
    const id = String(conversationId ?? "").trim();

    if (!id) {
      throw new Error(
        "A conversation ID is required to mark messages as read."
      );
    }

    try {
      await api.patch(
        `/api/messages/conversations/${encodeURIComponent(id)}/read`
      );
    } catch (error) {
      console.error(
        "Failed to mark conversation as read:",
        error
      );

      throw new Error(
        extractApiError(
          error,
          "Unable to update the conversation's read status."
        )
      );
    }
  },
};

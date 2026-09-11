import { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";

interface Conversation {
  id: string;
  participantId: string | null;
  participantType: string;
  participantName?: string | null;
  participantRole?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderType: string;
  senderId: string | null;
  senderName?: string | null;
  message: string;
  createdAt: string;
  readAt?: string | null;
}

interface ConversationMessagesResponse {
  conversation: Conversation;
  messages: Message[];
}

type NewChatTarget = {
  id: string | null;
  type: "EMPLOYER" | "CANDIDATE" | "CHATBOT";
  name: string;
  role: string;
  description: string;
};

const TEST_CONTACTS: NewChatTarget[] = [
  {
    id: "50000000-0000-0000-0000-000000000001",
    type: "EMPLOYER",
    name: "TechNova Solutions",
    role: "Company",
    description: "Employer test account",
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    type: "CANDIDATE",
    name: "John Dlamini",
    role: "Candidate",
    description: "Candidate test account",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    type: "CANDIDATE",
    name: "Thandi Mokoena",
    role: "Candidate",
    description: "Candidate test account",
  },
  {
    id: null,
    type: "CHATBOT",
    name: "TruCity Assistant",
    role: "System",
    description: "Chatbot test conversation",
  },
];

function formatTime(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name?: string | null) {
  if (!name) {
    return "?";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function getErrorMessage(error: unknown) {
  const axiosError = error as {
    response?: {
      data?: {
        message?: string;
        error?: string;
      };
    };
    message?: string;
  };

  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    axiosError.message ||
    "Something went wrong while communicating with the messaging service."
  );
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  const [search, setSearch] = useState("");

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [creatingConversation, setCreatingConversation] =
    useState(false);

  const [showNewConversation, setShowNewConversation] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * =========================================================
   * LOAD CONVERSATIONS
   * =========================================================
   */

  async function loadConversations(selectId?: string) {
    try {
      setLoadingConversations(true);
      setError("");

      const response = await api.get<Conversation[]>(
        "/api/messages/conversations"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setConversations(data);

      if (selectId) {
        const matching = data.find(
          (conversation: Conversation) =>
            conversation.id === selectId
        );

        if (matching) {
          setSelectedConversation(matching);
        }
      }
    } catch (err) {
      console.error(
        "Failed to load admin conversations:",
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setLoadingConversations(false);
    }
  }

  /*
   * =========================================================
   * LOAD MESSAGES
   * =========================================================
   */

  async function loadMessages(
    conversation: Conversation
  ) {
    try {
      setLoadingMessages(true);
      setError("");

      const response =
        await api.get<ConversationMessagesResponse>(
          `/api/messages/conversations/${conversation.id}`
        );

      const data = response.data;

      setMessages(
        Array.isArray(data?.messages)
          ? data.messages
          : []
      );

      if (data?.conversation) {
        setSelectedConversation(
          data.conversation
        );
      }
    } catch (err) {
      console.error(
        "Failed to load conversation messages:",
        err
      );

      setError(getErrorMessage(err));
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    void loadConversations();
  }, []);

  /*
   * =========================================================
   * SELECT CONVERSATION
   * =========================================================
   */

  function handleSelectConversation(
    conversation: Conversation
  ) {
    setSelectedConversation(conversation);
    setSuccess("");
    void loadMessages(conversation);
  }

  /*
   * =========================================================
   * CREATE CONVERSATION
   * =========================================================
   */

  async function handleCreateConversation(
    target: NewChatTarget
  ) {
    try {
      setCreatingConversation(true);
      setError("");
      setSuccess("");

      const response =
        await api.post<Conversation>(
          "/api/messages/conversations",
          {
            targetType: target.type,
            targetId: target.id,
          }
        );

      const conversation = response.data;

      setShowNewConversation(false);

      await loadConversations(
        conversation.id
      );

      setSelectedConversation(
        conversation
      );

      await loadMessages(
        conversation
      );

      setSuccess(
        `Conversation with ${target.name} is ready.`
      );
    } catch (err) {
      console.error(
        "Failed to create conversation:",
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setCreatingConversation(false);
    }
  }

  /*
   * =========================================================
   * SEND MESSAGE
   * =========================================================
   */

  async function sendMessage() {
    if (
      !selectedConversation ||
      !messageText.trim() ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError("");
      setSuccess("");

      await api.post<Message>(
        `/api/messages/conversations/${selectedConversation.id}/messages`,
        {
          message: messageText.trim(),
        }
      );

      setMessageText("");

      await loadMessages(
        selectedConversation
      );

      await loadConversations(
        selectedConversation.id
      );
    } catch (err) {
      console.error(
        "Failed to send message:",
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  /*
   * =========================================================
   * FILTER CONVERSATIONS
   * =========================================================
   */

  const filteredConversations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return conversations;
      }

      return conversations.filter(
        (conversation: Conversation) =>
          conversation.participantName
            ?.toLowerCase()
            .includes(query) ||
          conversation.participantRole
            ?.toLowerCase()
            .includes(query) ||
          conversation.lastMessage
            ?.toLowerCase()
            .includes(query)
      );
    }, [conversations, search]);

  /*
   * =========================================================
   * STATS
   * =========================================================
   */

  const unreadCount =
    conversations.reduce(
      (
        total: number,
        conversation: Conversation
      ) =>
        total +
        (conversation.unreadCount ?? 0),
      0
    );

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <main className="admin-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div>
          <div className="admin-page-eyebrow">
            COMMUNICATION
          </div>

          <h1
            style={{
              margin: "6px 0 6px",
            }}
          >
            Messages
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Communicate with candidates,
            employers and the TruCity Assistant.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowNewConversation(true)
          }
          style={{
            border: "1px solid #1d4ed8",
            borderRadius: 8,
            background: "#1d4ed8",
            color: "#fff",
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          + New conversation
        </button>
      </div>

      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <section className="admin-list-summary">
        <div>
          <strong>
            {loadingConversations
              ? "—"
              : conversations.length}
          </strong>

          <span>Conversations</span>
        </div>

        <div>
          <strong>
            {loadingConversations
              ? "—"
              : unreadCount}
          </strong>

          <span>Unread</span>
        </div>

        <div>
          <strong>
            {
              conversations.filter(
                (conversation: Conversation) =>
                  conversation.participantType ===
                  "CANDIDATE"
              ).length
            }
          </strong>

          <span>Candidate chats</span>
        </div>

        <div>
          <strong>
            {
              conversations.filter(
                (conversation: Conversation) =>
                  conversation.participantType ===
                  "EMPLOYER"
              ).length
            }
          </strong>

          <span>Employer chats</span>
        </div>

        <div>
          <strong>
            {
              conversations.filter(
                (conversation: Conversation) =>
                  conversation.participantType ===
                  "CHATBOT"
              ).length
            }
          </strong>

          <span>Assistant chats</span>
        </div>
      </section>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            border: "1px solid #bbf7d0",
            borderRadius: 8,
            background: "#f0fdf4",
            color: "#15803d",
            fontSize: 12,
          }}
        >
          {success}
        </div>
      )}

      {/* =====================================================
          MESSAGES WORKSPACE
          ===================================================== */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "320px minmax(0, 1fr)",
          minHeight: 620,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow:
            "0 8px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        {/* =================================================
            CONVERSATION LIST
            ================================================= */}

        <aside
          style={{
            borderRight:
              "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              padding: 16,
              borderBottom:
                "1px solid #e2e8f0",
              background: "#fff",
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search conversations..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding:
                  "10px 12px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 8,
                outline: "none",
                fontSize: 12,
                color: "#0f172a",
                background: "#fff",
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
            }}
          >
            {loadingConversations ? (
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: 12,
                }}
              >
                Loading conversations...
              </div>
            ) : filteredConversations.length ===
              0 ? (
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: 12,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: "#334155",
                    marginBottom: 6,
                  }}
                >
                  No conversations yet
                </strong>

                Start a new conversation
                to test messaging.
              </div>
            ) : (
              filteredConversations.map(
                (
                  conversation: Conversation
                ) => {
                  const active =
                    selectedConversation?.id ===
                    conversation.id;

                  return (
                    <button
                      key={
                        conversation.id
                      }
                      type="button"
                      onClick={() =>
                        handleSelectConversation(
                          conversation
                        )
                      }
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems:
                          "flex-start",
                        gap: 11,
                        padding:
                          "14px 15px",
                        border: "none",
                        borderBottom:
                          "1px solid #e2e8f0",
                        background: active
                          ? "#eff6ff"
                          : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          minWidth: 40,
                          borderRadius:
                            "50%",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          background:
                            conversation.participantType ===
                            "CHATBOT"
                              ? "#ede9fe"
                              : "#dbeafe",
                          color:
                            conversation.participantType ===
                            "CHATBOT"
                              ? "#7c3aed"
                              : "#1d4ed8",
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {conversation.participantType ===
                        "CHATBOT"
                          ? "AI"
                          : getInitials(
                              conversation.participantName
                            )}
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: 8,
                          }}
                        >
                          <strong
                            style={{
                              color:
                                "#0f172a",
                              fontSize: 12,
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {conversation.participantName ||
                              "Unknown participant"}
                          </strong>

                          {conversation.lastMessageAt && (
                            <span
                              style={{
                                color:
                                  "#94a3b8",
                                fontSize: 10,
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {formatTime(
                                conversation.lastMessageAt
                              )}
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 6,
                            marginTop: 3,
                          }}
                        >
                          <span
                            style={{
                              color:
                                "#64748b",
                              fontSize: 10,
                            }}
                          >
                            {conversation.participantRole ||
                              conversation.participantType}
                          </span>

                          {(conversation.unreadCount ??
                            0) > 0 && (
                            <span
                              style={{
                                minWidth: 18,
                                height: 18,
                                padding:
                                  "0 5px",
                                borderRadius:
                                  999,
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                background:
                                  "#2563eb",
                                color:
                                  "#fff",
                                fontSize: 9,
                                fontWeight:
                                  800,
                              }}
                            >
                              {
                                conversation.unreadCount
                              }
                            </span>
                          )}
                        </div>

                        <p
                          style={{
                            margin:
                              "5px 0 0",
                            color:
                              "#64748b",
                            fontSize: 11,
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {conversation.lastMessage ||
                            "No messages yet"}
                        </p>
                      </div>
                    </button>
                  );
                }
              )
            )}
          </div>
        </aside>

        {/* =================================================
            CHAT PANEL
            ================================================= */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            background: "#fff",
          }}
        >
          {!selectedConversation ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 40,
                textAlign: "center",
              }}
            >
              <div>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    margin: "0 auto 18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    background: "#eff6ff",
                    color: "#2563eb",
                    fontSize: 26,
                  }}
                >
                  💬
                </div>

                <h2
                  style={{
                    margin:
                      "0 0 7px",
                    color: "#0f172a",
                    fontSize: 18,
                  }}
                >
                  Your messages
                </h2>

                <p
                  style={{
                    margin: 0,
                    maxWidth: 390,
                    color: "#64748b",
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  Select a conversation
                  or start a new one to
                  test the TruCity
                  messaging system.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowNewConversation(
                      true
                    )
                  }
                  style={{
                    marginTop: 18,
                    padding:
                      "10px 15px",
                    border: 0,
                    borderRadius: 8,
                    background:
                      "#1d4ed8",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Start a conversation
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}

              <header
                style={{
                  padding:
                    "15px 18px",
                  borderBottom:
                    "1px solid #e2e8f0",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: 11,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      minWidth: 42,
                      borderRadius:
                        "50%",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      background:
                        selectedConversation.participantType ===
                        "CHATBOT"
                          ? "#ede9fe"
                          : "#dbeafe",
                      color:
                        selectedConversation.participantType ===
                        "CHATBOT"
                          ? "#7c3aed"
                          : "#1d4ed8",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {selectedConversation.participantType ===
                    "CHATBOT"
                      ? "AI"
                      : getInitials(
                          selectedConversation.participantName
                        )}
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        color:
                          "#0f172a",
                        fontSize: 14,
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {selectedConversation.participantName ||
                        "Unknown participant"}
                    </h2>

                    <div
                      style={{
                        marginTop: 3,
                        color:
                          "#64748b",
                        fontSize: 10,
                      }}
                    >
                      {selectedConversation.participantRole ||
                        selectedConversation.participantType}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    padding:
                      "5px 9px",
                    borderRadius:
                      999,
                    background:
                      "#f1f5f9",
                    color:
                      "#475569",
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing:
                      0.4,
                  }}
                >
                  {selectedConversation.participantType}
                </span>
              </header>

              {/* MESSAGES */}

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: 22,
                  background:
                    "#f8fafc",
                }}
              >
                {loadingMessages ? (
                  <div
                    style={{
                      height: "100%",
                      minHeight: 300,
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      color:
                        "#64748b",
                      fontSize: 12,
                    }}
                  >
                    Loading messages...
                  </div>
                ) : messages.length ===
                  0 ? (
                  <div
                    style={{
                      height: "100%",
                      minHeight: 300,
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      textAlign:
                        "center",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          display:
                            "block",
                          color:
                            "#334155",
                          fontSize: 13,
                        }}
                      >
                        No messages yet
                      </strong>

                      <p
                        style={{
                          margin:
                            "6px 0 0",
                          color:
                            "#64748b",
                          fontSize: 11,
                        }}
                      >
                        Send the first
                        message below.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: 12,
                    }}
                  >
                    {messages.map(
                      (message: Message) => {
                        const isMine =
                          message.senderType ===
                            "ADMIN" ||
                          message.senderName ===
                            "Admin";

                        return (
                          <div
                            key={
                              message.id
                            }
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                isMine
                                  ? "flex-end"
                                  : "flex-start",
                            }}
                          >
                            <div
                              style={{
                                maxWidth:
                                  "72%",
                              }}
                            >
                              <div
                                style={{
                                  padding:
                                    "10px 13px",
                                  borderRadius:
                                    isMine
                                      ? "14px 14px 3px 14px"
                                      : "14px 14px 14px 3px",
                                  background:
                                    isMine
                                      ? "#1d4ed8"
                                      : "#fff",
                                  color:
                                    isMine
                                      ? "#fff"
                                      : "#0f172a",
                                  border:
                                    isMine
                                      ? "none"
                                      : "1px solid #e2e8f0",
                                  boxShadow:
                                    isMine
                                      ? "none"
                                      : "0 1px 2px rgba(15,23,42,.04)",
                                }}
                              >
                                {!isMine && (
                                  <div
                                    style={{
                                      marginBottom:
                                        4,
                                      color:
                                        "#64748b",
                                      fontSize:
                                        9,
                                      fontWeight:
                                        800,
                                    }}
                                  >
                                    {message.senderName ||
                                      message.senderType}
                                  </div>
                                )}

                                <div
                                  style={{
                                    fontSize:
                                      12,
                                    lineHeight:
                                      1.55,
                                    whiteSpace:
                                      "pre-wrap",
                                    wordBreak:
                                      "break-word",
                                  }}
                                >
                                  {
                                    message.message
                                  }
                                </div>
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    4,
                                  textAlign:
                                    isMine
                                      ? "right"
                                      : "left",
                                  color:
                                    "#94a3b8",
                                  fontSize:
                                    9,
                                }}
                              >
                                {formatTime(
                                  message.createdAt
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* COMPOSER */}

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage();
                }}
                style={{
                  padding:
                    "14px 16px",
                  borderTop:
                    "1px solid #e2e8f0",
                  background:
                    "#fff",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "flex-end",
                    gap: 9,
                  }}
                >
                  <textarea
                    value={
                      messageText
                    }
                    onChange={(
                      event
                    ) =>
                      setMessageText(
                        event.target
                          .value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                          "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();

                        if (
                          messageText.trim()
                        ) {
                          void sendMessage();
                        }
                      }
                    }}
                    placeholder="Write a message..."
                    rows={2}
                    disabled={sending}
                    style={{
                      flex: 1,
                      resize: "none",
                      padding:
                        "10px 12px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius: 8,
                      outline: "none",
                      fontFamily:
                        "inherit",
                      fontSize: 12,
                      lineHeight:
                        1.5,
                      color:
                        "#0f172a",
                    }}
                  />

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !messageText.trim()
                    }
                    style={{
                      padding:
                        "10px 17px",
                      border: 0,
                      borderRadius: 8,
                      background:
                        sending ||
                        !messageText.trim()
                          ? "#cbd5e1"
                          : "#1d4ed8",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor:
                        sending ||
                        !messageText.trim()
                          ? "not-allowed"
                          : "pointer",
                      minHeight: 42,
                    }}
                  >
                    {sending
                      ? "Sending..."
                      : "Send"}
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color:
                      "#94a3b8",
                    fontSize: 9,
                  }}
                >
                  Press Enter to send ·
                  Shift + Enter for a new
                  line
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {/* =====================================================
          NEW CONVERSATION MODAL
          ===================================================== */}

      {showNewConversation && (
        <div
          className="admin-modal-overlay"
          onClick={() => {
            if (!creatingConversation) {
              setShowNewConversation(
                false
              );
            }
          }}
        >
          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              maxWidth: 560,
            }}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-modal-eyebrow">
                  NEW CONVERSATION
                </span>

                <h2>
                  Start a conversation
                </h2>

                <p>
                  Choose a participant to
                  test the messaging system.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowNewConversation(
                    false
                  )
                }
                disabled={
                  creatingConversation
                }
                style={{
                  border: 0,
                  background:
                    "transparent",
                  color: "#64748b",
                  fontSize: 20,
                  cursor:
                    creatingConversation
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: 18,
                display: "grid",
                gap: 10,
              }}
            >
              {TEST_CONTACTS.map(
                (
                  contact: NewChatTarget
                ) => (
                  <button
                    key={`${contact.type}-${contact.id ?? "chatbot"}`}
                    type="button"
                    disabled={
                      creatingConversation
                    }
                    onClick={() =>
                      void handleCreateConversation(
                        contact
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: 13,
                      width: "100%",
                      padding:
                        "13px 14px",
                      border:
                        "1px solid #e2e8f0",
                      borderRadius: 9,
                      background:
                        "#fff",
                      cursor:
                        creatingConversation
                          ? "not-allowed"
                          : "pointer",
                      textAlign:
                        "left",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        minWidth: 42,
                        borderRadius:
                          "50%",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        background:
                          contact.type ===
                          "CHATBOT"
                            ? "#ede9fe"
                            : "#eff6ff",
                        color:
                          contact.type ===
                          "CHATBOT"
                            ? "#7c3aed"
                            : "#1d4ed8",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {contact.type ===
                      "CHATBOT"
                        ? "AI"
                        : getInitials(
                            contact.name
                          )}
                    </div>

                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <strong
                        style={{
                          display:
                            "block",
                          color:
                            "#0f172a",
                          fontSize: 12,
                        }}
                      >
                        {contact.name}
                      </strong>

                      <span
                        style={{
                          display:
                            "block",
                          marginTop:
                            3,
                          color:
                            "#64748b",
                          fontSize: 10,
                        }}
                      >
                        {contact.role}
                      </span>

                      <span
                        style={{
                          display:
                            "block",
                          marginTop:
                            3,
                          color:
                            "#94a3b8",
                          fontSize: 10,
                        }}
                      >
                        {
                          contact.description
                        }
                      </span>
                    </div>

                    <span
                      style={{
                        color:
                          "#2563eb",
                        fontSize: 16,
                      }}
                    >
                      →
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
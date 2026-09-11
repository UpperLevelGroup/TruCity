import React, { useEffect, useRef, useState } from 'react';

interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
}

interface ChatThread {
  id: number;
  name: string;
  role: string;
  messages: Message[];
}

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Senior React Developer',
    messages: [
      {
        id: 1,
        sender: 'them',
        text: 'Hi! I saw your post regarding the React position.',
        timestamp: '10:32',
      },
      {
        id: 2,
        sender: 'me',
        text: 'Great to connect! Are you available for an interview this week?',
        timestamp: '10:35',
      },
    ],
  },
  {
    id: 2,
    name: 'TruCity Verification Bot',
    role: 'System',
    messages: [
      {
        id: 3,
        sender: 'them',
        text: 'Your CIPC registry details and domain have been successfully verified.',
        timestamp: '09:15',
      },
    ],
  },
];

const STORAGE_KEY = 'trucity_company_messages';

function loadThreads(): ChatThread[] {
  try {
    const savedThreads = localStorage.getItem(STORAGE_KEY);

    if (!savedThreads) {
      return INITIAL_THREADS;
    }

    const parsedThreads = JSON.parse(savedThreads);

    if (!Array.isArray(parsedThreads)) {
      return INITIAL_THREADS;
    }

    return parsedThreads;
  } catch {
    return INITIAL_THREADS;
  }
}

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<number>(1);
  const [newMessage, setNewMessage] = useState('');
  const [chatThreads, setChatThreads] =
    useState<ChatThread[]>(loadThreads);

  const messageBoxRef = useRef<HTMLDivElement | null>(null);

  /*
   * Persist messages locally for now.
   *
   * Later this storage layer can be replaced with:
   *
   * companyService.getMessages()
   * companyService.sendMessage()
   *
   * without changing the visual structure of this page.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(chatThreads)
      );
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }, [chatThreads]);

  /*
   * Automatically scroll to the latest message.
   */
  useEffect(() => {
    const messageBox = messageBoxRef.current;

    if (messageBox) {
      messageBox.scrollTop = messageBox.scrollHeight;
    }
  }, [selectedChat, chatThreads]);

  const selectedThread = chatThreads.find(
    (thread) => thread.id === selectedChat
  );

  const handleSelectChat = (threadId: number) => {
    setSelectedChat(threadId);
    setNewMessage('');
  };

  const handleSendMessage = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const messageText = newMessage.trim();

    if (!messageText || !selectedThread) {
      return;
    }

    const newMessageObject: Message = {
      id: Date.now(),
      sender: 'me',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setChatThreads((previousThreads) =>
      previousThreads.map((thread) => {
        if (thread.id !== selectedChat) {
          return thread;
        }

        return {
          ...thread,
          messages: [
            ...thread.messages,
            newMessageObject,
          ],
        };
      })
    );

    setNewMessage('');
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      const form = event.currentTarget.form;

      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div
      className="min-h-screen font-sans flex flex-col justify-between overflow-x-hidden relative"
      style={{
        backgroundColor: '#ffffff',
        color: '#003366',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* SkyBlue Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-sky-400/10 rounded-full blur-[160px]" />
      </div>

      <div
        style={styles.container}
        className="relative z-10 p-6 lg:p-12 w-full"
      >
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.title}>Messages</h1>

          <p style={styles.subtitle}>
            Communicate directly with candidate leads.
          </p>
        </header>

        {/* Chat Window */}
        <div style={styles.chatWindow}>
          {/* Thread Sidebar */}
          <div style={styles.threadList}>
            <div style={styles.threadHeader}>
              <span style={styles.threadHeaderTitle}>
                Conversations
              </span>

              <span style={styles.threadCount}>
                {chatThreads.length}
              </span>
            </div>

            {chatThreads.length === 0 ? (
              <div style={styles.emptyThreads}>
                No conversations yet.
              </div>
            ) : (
              chatThreads.map((thread) => {
                const lastMessage =
                  thread.messages[thread.messages.length - 1];

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => handleSelectChat(thread.id)}
                    style={
                      selectedChat === thread.id
                        ? styles.activeThread
                        : styles.threadItem
                    }
                  >
                    <strong style={styles.threadName}>
                      {thread.name}
                    </strong>

                    <span style={styles.threadRole}>
                      {thread.role}
                    </span>

                    {lastMessage && (
                      <span style={styles.threadPreview}>
                        {lastMessage.text}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Message View Area */}
          <div style={styles.chatArea}>
            {selectedThread ? (
              <>
                {/* Chat Header */}
                <div style={styles.chatHeader}>
                  <div>
                    <h2 style={styles.chatName}>
                      {selectedThread.name}
                    </h2>

                    <p style={styles.chatRole}>
                      {selectedThread.role}
                    </p>
                  </div>

                  <span style={styles.onlineBadge}>
                    ● Active
                  </span>
                </div>

                {/* Messages */}
                <div
                  ref={messageBoxRef}
                  style={styles.messageBox}
                >
                  {selectedThread.messages.length === 0 ? (
                    <div style={styles.emptyMessages}>
                      <p style={styles.emptyMessagesTitle}>
                        No messages yet
                      </p>

                      <p style={styles.emptyMessagesText}>
                        Start the conversation below.
                      </p>
                    </div>
                  ) : (
                    selectedThread.messages.map((message) => (
                      <div
                        key={message.id}
                        style={{
                          ...styles.messageWrapper,
                          alignItems:
                            message.sender === 'me'
                              ? 'flex-end'
                              : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            ...styles.messageBubble,
                            backgroundColor:
                              message.sender === 'me'
                                ? '#003366'
                                : '#f8fafc',
                            color:
                              message.sender === 'me'
                                ? '#ffffff'
                                : '#003366',
                            border:
                              message.sender === 'me'
                                ? 'none'
                                : '1px solid #e2e8f0',
                            boxShadow:
                              message.sender === 'me'
                                ? '0 2px 4px rgba(0, 51, 102, 0.2)'
                                : 'none',
                          }}
                        >
                          {message.text}
                        </div>

                        <span
                          style={{
                            ...styles.messageTime,
                            alignSelf:
                              message.sender === 'me'
                                ? 'flex-end'
                                : 'flex-start',
                          }}
                        >
                          {message.timestamp}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Send Message */}
                <form
                  onSubmit={handleSendMessage}
                  style={styles.sendForm}
                >
                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={newMessage}
                    onChange={(event) =>
                      setNewMessage(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    style={styles.chatInput}
                    aria-label="Message"
                  />

                  <button
                    type="submit"
                    style={{
                      ...styles.sendBtn,
                      opacity:
                        newMessage.trim().length === 0
                          ? 0.6
                          : 1,
                    }}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div style={styles.noChatSelected}>
                <h2 style={styles.noChatTitle}>
                  Select a conversation
                </h2>

                <p style={styles.noChatText}>
                  Choose a conversation from the left to view
                  messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white">
        <div
          className="max-w-6xl mx-auto px-6 lg:px-12 py-5 text-center text-xs"
          style={{ color: '#64748b' }}
        >
          © {new Date().getFullYear()}{' '}
          <span
            className="font-semibold"
            style={{ color: '#003366' }}
          >
            UpperLevel Group
          </span>
          . All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    width: '100%',
  },

  header: {
    marginBottom: '24px',
  },

  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#003366',
    marginBottom: '4px',
    letterSpacing: '-0.02em',
  },

  subtitle: {
    fontSize: '14px',
    color: '#475569',
    fontWeight: '500',
  },

  chatWindow: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '0px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    minHeight: '520px',
    boxShadow:
      '0 4px 6px -1px rgba(0, 51, 102, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
  },

  threadList: {
    borderRight: '1px solid #e2e8f0',
    padding: '16px',
    backgroundColor: '#f8fafc',
    overflowY: 'auto',
  },

  threadHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 6px 14px 6px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '10px',
  },

  threadHeaderTitle: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  threadCount: {
    fontSize: '10px',
    color: '#003366',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    padding: '3px 7px',
    borderRadius: '8px',
    fontWeight: '800',
  },

  threadItem: {
    width: '100%',
    textAlign: 'left',
    border: '1px solid transparent',
    padding: '14px',
    borderRadius: '12px',
    cursor: 'pointer',
    marginBottom: '6px',
    transition: 'background-color 0.2s',
    backgroundColor: 'transparent',
    display: 'block',
  },

  activeThread: {
    width: '100%',
    textAlign: 'left',
    border: '1px solid #cbd5e1',
    padding: '14px',
    borderRadius: '12px',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    marginBottom: '6px',
    boxShadow:
      '0 4px 6px -1px rgba(0, 51, 102, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
    display: 'block',
  },

  threadName: {
    fontSize: '14px',
    display: 'block',
    color: '#003366',
    fontWeight: '800',
    marginBottom: '2px',
  },

  threadRole: {
    fontSize: '12px',
    color: '#475569',
    fontWeight: '600',
    display: 'block',
  },

  threadPreview: {
    display: 'block',
    marginTop: '7px',
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  emptyThreads: {
    padding: '24px 12px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '500',
  },

  chatArea: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px',
    backgroundColor: '#ffffff',
    minWidth: 0,
  },

  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '18px',
    marginBottom: '4px',
    borderBottom: '1px solid #f1f5f9',
  },

  chatName: {
    margin: 0,
    color: '#003366',
    fontSize: '17px',
    fontWeight: '800',
  },

  chatRole: {
    margin: '3px 0 0 0',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '600',
  },

  onlineBadge: {
    color: '#b45309',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '10px',
    padding: '5px 9px',
    fontSize: '10px',
    fontWeight: '800',
  },

  messageBox: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '360px',
    padding: '18px 4px',
  },

  messageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxWidth: '75%',
  },

  messageBubble: {
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },

  messageTime: {
    fontSize: '9px',
    color: '#94a3b8',
    fontWeight: '500',
  },

  emptyMessages: {
    margin: 'auto',
    textAlign: 'center',
    padding: '32px',
  },

  emptyMessagesTitle: {
    margin: '0 0 4px 0',
    color: '#003366',
    fontSize: '15px',
    fontWeight: '800',
  },

  emptyMessagesText: {
    margin: 0,
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '500',
  },

  sendForm: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },

  chatInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    color: '#003366',
    backgroundColor: '#ffffff',
    fontWeight: '500',
    minWidth: 0,
  },

  sendBtn: {
    padding: '12px 24px',
    backgroundColor: '#003366',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 51, 102, 0.2)',
    transition: 'background-color 0.2s',
  },

  noChatSelected: {
    margin: 'auto',
    textAlign: 'center',
    padding: '40px',
  },

  noChatTitle: {
    margin: '0 0 6px 0',
    color: '#003366',
    fontSize: '18px',
    fontWeight: '800',
  },

  noChatText: {
    margin: 0,
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
  },
};
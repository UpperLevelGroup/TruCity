import React, { useEffect, useRef, useState } from 'react';
import { companyService } from '../company.service';
import type { CompanyChatThread } from '../company.types';

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatThreads, setChatThreads] = useState<CompanyChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');

  const messageBoxRef = useRef<HTMLDivElement | null>(null);

  /* Load real conversations from the authenticated backend. */
  useEffect(() => {
    let active = true;

    const loadConversations = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const threads = await companyService.getMessages();
        if (!active) return;

        setChatThreads(threads);
        setSelectedChat((current) => {
          if (current && threads.some((thread) => thread.id === current)) {
            return current;
          }
          return threads[0]?.id ?? null;
        });
      } catch (error) {
        console.error('Failed to load conversations:', error);
        if (active) {
          setLoadError(
            'Unable to load conversations. Please check your connection and try again.'
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadConversations();

    return () => {
      active = false;
    };
  }, []);

  /* Mark the selected conversation as read and refresh its messages. */
  useEffect(() => {
    if (!selectedChat) return;

    let active = true;

    const refreshSelectedConversation = async () => {
      try {
        await companyService.markConversationRead(selectedChat);
        const latestThread = await companyService.getConversation(selectedChat);

        if (!active || !latestThread) return;

        setChatThreads((previousThreads) =>
          previousThreads.map((thread) =>
            thread.id === latestThread.id
              ? { ...latestThread, unread: 0 }
              : thread
          )
        );
      } catch (error) {
        console.error('Failed to refresh selected conversation:', error);
      }
    };

    void refreshSelectedConversation();

    return () => {
      active = false;
    };
  }, [selectedChat]);

  /* Automatically scroll to the latest message. */
  useEffect(() => {
    const messageBox = messageBoxRef.current;
    if (messageBox) messageBox.scrollTop = messageBox.scrollHeight;
  }, [selectedChat, chatThreads]);

  const selectedThread = chatThreads.find(
    (thread) => thread.id === selectedChat
  );

  const handleSelectChat = (threadId: string) => {
    setSelectedChat(threadId);
    setNewMessage('');
    setSendError('');
  };

  const handleSendMessage = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const messageText = newMessage.trim();
    if (!messageText || !selectedThread || isSending) return;

    setIsSending(true);
    setSendError('');

    try {
      const refreshedThreads = await companyService.sendMessage({
        threadId: selectedThread.id,
        text: messageText,
      });

      setChatThreads(refreshedThreads);
      setNewMessage('');

      // Keep the selected conversation open after the service refreshes the list.
      setSelectedChat(selectedThread.id);
    } catch (error) {
      console.error('Failed to send message:', error);
      setSendError('Your message could not be sent. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const handleRetry = async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const threads = await companyService.getMessages();
      setChatThreads(threads);
      setSelectedChat((current) =>
        current && threads.some((thread) => thread.id === current)
          ? current
          : threads[0]?.id ?? null
      );
    } catch (error) {
      console.error('Failed to reload conversations:', error);
      setLoadError(
        'Unable to load conversations. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen font-sans flex flex-col justify-between overflow-x-hidden relative"
      style={{
        backgroundColor: 'var(--trucity-page)',
        color: 'var(--trucity-text)',
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
              <span style={styles.threadHeaderTitle}>Conversations</span>
              <span style={styles.threadCount}>{chatThreads.length}</span>
            </div>

            {isLoading ? (
              <div style={styles.emptyThreads} role="status">
                Loading conversations...
              </div>
            ) : loadError ? (
              <div style={styles.emptyThreads}>
                <p>{loadError}</p>
                <button type="button" onClick={handleRetry} style={styles.retryBtn}>
                  Try again
                </button>
              </div>
            ) : chatThreads.length === 0 ? (
              <div style={styles.emptyThreads}>No conversations yet.</div>
            ) : (
              chatThreads.map((thread) => {
                const lastMessage = thread.messages[thread.messages.length - 1];

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
                    aria-current={selectedChat === thread.id ? 'true' : undefined}
                  >
                    <span style={styles.threadName}>{thread.name}</span>
                    <span style={styles.threadRole}>{thread.role}</span>
                    {lastMessage && (
                      <span style={styles.threadPreview}>{lastMessage.text}</span>
                    )}
                    {(thread.unread ?? 0) > 0 && (
                      <span style={styles.unreadBadge}>
                        {thread.unread! > 99 ? '99+' : thread.unread}
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
                    <h2 style={styles.chatName}>{selectedThread.name}</h2>
                    <p style={styles.chatRole}>{selectedThread.role}</p>
                  </div>
                  <span style={styles.onlineBadge}>● Conversation</span>
                </div>

                {/* Messages */}
                <div ref={messageBoxRef} style={styles.messageBox} aria-live="polite">
                  {selectedThread.messages.length === 0 ? (
                    <div style={styles.emptyMessages}>
                      <p style={styles.emptyMessagesTitle}>No messages yet</p>
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
                          alignItems: message.sender === 'me' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            ...styles.messageBubble,
                            backgroundColor: message.sender === 'me' ? '#003366' : '#f8fafc',
                            color: message.sender === 'me' ? '#ffffff' : '#003366',
                            border: message.sender === 'me' ? 'none' : '1px solid #e2e8f0',
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
                            alignSelf: message.sender === 'me' ? 'flex-end' : 'flex-start',
                          }}
                        >
                          {message.timestamp}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {sendError && (
                  <p style={styles.errorText} role="alert">{sendError}</p>
                )}

                {/* Send Message */}
                <form onSubmit={handleSendMessage} style={styles.sendForm}>
                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={handleKeyDown}
                    style={styles.chatInput}
                    aria-label="Message"
                    maxLength={5000}
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    style={{
                      ...styles.sendBtn,
                      opacity: newMessage.trim().length === 0 || isSending ? 0.6 : 1,
                    }}
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </>
            ) : (
              <div style={styles.noChatSelected}>
                <h2 style={styles.noChatTitle}>
                  {isLoading ? 'Loading messages...' : 'Select a conversation'}
                </h2>
                <p style={styles.noChatText}>
                  {isLoading
                    ? 'Your conversations will appear here.'
                    : loadError
                      ? 'Reload the conversations to try again.'
                      : 'Choose a conversation from the left to view messages.'}
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
          <span className="font-semibold" style={{ color: '#003366' }}>
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
    boxShadow: '0 4px 6px -1px rgba(0, 51, 102, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
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
    position: 'relative',
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
    boxShadow: '0 4px 6px -1px rgba(0, 51, 102, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
    display: 'block',
    position: 'relative',
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
  unreadBadge: {
    display: 'inline-block',
    marginTop: '8px',
    backgroundColor: '#003366',
    color: '#ffffff',
    borderRadius: '999px',
    padding: '2px 7px',
    fontSize: '10px',
    fontWeight: '800',
  },
  emptyThreads: {
    padding: '24px 12px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '500',
  },
  retryBtn: {
    marginTop: '10px',
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    color: '#003366',
    backgroundColor: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
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
  errorText: {
    margin: '8px 0 0',
    color: '#b91c1c',
    fontSize: '12px',
    fontWeight: '600',
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

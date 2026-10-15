import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, ChevronLeft, Clock, Send, MessageCircle, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { candidateMessagingService, type CandidateConversation, type CandidateMessage } from '../candidateMessaging.service';

interface MessageRouteState {
  source?: 'company-contact';
  company?: string;
  companyId?: string;
  allowCvAttachment?: boolean;
}

function formatTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function apiErrorMessage(error: unknown, fallback: string): string {
  const candidate = error as { response?: { data?: { message?: string; detail?: string } }; message?: string };
  return candidate?.response?.data?.message || candidate?.response?.data?.detail || fallback;
}

export default function Messages() {
  const location = useLocation();
  const routeState = location.state as MessageRouteState | null;
  const [conversations, setConversations] = useState<CandidateConversation[]>([]);
  const [messages, setMessages] = useState<CandidateMessage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [showMobileList, setShowMobileList] = useState(!routeState?.company);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isStartingAdminChat, setIsStartingAdminChat] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [threadError, setThreadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [notice, setNotice] = useState('');
  const messageStreamRef = useRef<HTMLDivElement | null>(null);
  const draftRef = useRef<HTMLInputElement | null>(null);

  const loadConversations = useCallback(async (preferredId?: string | null) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const result = await candidateMessagingService.getConversations();
      setConversations(result);
      setActiveId((current) => {
        const preferred = preferredId ?? current;
        if (preferred && result.some((item) => item.id === preferred)) return preferred;
        if (routeState?.company) {
          const existingEmployer = result.find((item) =>
            item.participantType === 'EMPLOYER' &&
            item.participantName.trim().toLowerCase() === routeState.company?.trim().toLowerCase()
          );
          if (existingEmployer) return existingEmployer.id;
        }
        return current && result.some((item) => item.id === current) ? current : (result[0]?.id ?? null);
      });
    } catch (error) {
      setLoadError(apiErrorMessage(error, 'Unable to load messages. Please check your connection and try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [routeState?.company]);

  useEffect(() => { void loadConversations(); }, [loadConversations]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [conversations, activeId],
  );

    const loadActiveMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true);
      setThreadError('');

      try {
        // Load the thread even if the read-status update fails.
        const result =
          await candidateMessagingService.getMessages(
            conversationId
          );

        setMessages(result.messages ?? []);

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...result.conversation,
                  unreadCount: 0,
                }
              : conversation
          )
        );

        // Read status is useful, but should not block message display.
        void candidateMessagingService
          .markConversationRead(conversationId)
          .catch((error) => {
            console.error(
              'Failed to mark conversation as read:',
              error
            );
          });
      } catch (error) {
        setThreadError(
          apiErrorMessage(
            error,
            'Unable to load this conversation. Please try again.'
          )
        );
      } finally {
        setIsLoadingMessages(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    void loadActiveMessages(activeId);
  }, [activeId, loadActiveMessages]);

  useEffect(() => {
    if (messageStreamRef.current) messageStreamRef.current.scrollTop = messageStreamRef.current.scrollHeight;
  }, [messages, activeId]);

  useEffect(() => {
    if (!routeState?.company) return;
    setShowMobileList(false);
    setNotice('Candidates can start conversations with TruCity Admin only. You can reply to an employer here only if that employer has already opened a conversation with you.');
    const existing = conversations.find((conversation) =>
      conversation.participantType === 'EMPLOYER' &&
      conversation.participantName.trim().toLowerCase() === routeState.company?.trim().toLowerCase()
    );
    if (existing) setActiveId(existing.id);
  }, [routeState?.company, conversations]);

  const handleStartAdminConversation = async () => {
    setIsStartingAdminChat(true);
    setThreadError('');
    setLoadError('');
    setNotice('');
    try {
      const conversation = await candidateMessagingService.createAdminConversation();
      await loadConversations(conversation.id);
      setActiveId(conversation.id);
      setShowMobileList(false);
      setDraft('');
      setNotice('You are now connected to TruCity Admin. Send your message below.');
    } catch (error) {
      setLoadError(apiErrorMessage(error, 'Unable to start a conversation with Admin. Please try again.'));
    } finally {
      setIsStartingAdminChat(false);
    }
  };

  const handleSelectConversation = (conversation: CandidateConversation) => {
    setActiveId(conversation.id);
    setShowMobileList(false);
    setDraft('');
    setSendError('');
    setThreadError('');
    setNotice('');
  };

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeId || isSending) return;
    setIsSending(true);
    setSendError('');
    try {
      const savedMessage = await candidateMessagingService.sendMessage(activeId, text);
      setMessages((current) => [...current, savedMessage]);
      setDraft('');
      setConversations((current) => current.map((conversation) => conversation.id === activeId
        ? { ...conversation, lastMessage: savedMessage.text, lastMessageAt: savedMessage.createdAt, unreadCount: 0 }
        : conversation,
      ).sort((a, b) => new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()));
      // Refresh from the server so sender labels/read state stay authoritative.
      void loadActiveMessages(activeId);
      draftRef.current?.focus();
    } catch (error) {
      setSendError(apiErrorMessage(error, 'Your message was not sent. Please try again.'));
    } finally {
      setIsSending(false);
    }
  };

  const isAdminConversation = activeConversation?.participantType === 'ADMIN';
  const isEmployerConversation = activeConversation?.participantType === 'EMPLOYER';

  return (
    <div className="relative min-h-[calc(100dvh-88px)] overflow-x-hidden bg-transparent px-4 py-6 font-sans text-brand-text sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto flex h-[calc(100dvh-136px)] min-h-[620px] w-full max-w-[1480px] overflow-hidden rounded-[28px] border border-brand-border bg-white/95 shadow-[0_22px_55px_rgba(0,70,109,0.10)] backdrop-blur-sm">
        <aside className={`w-full shrink-0 flex-col border-r border-brand-border bg-white/95 md:w-[340px] lg:w-[380px] ${showMobileList ? 'flex' : 'hidden md:flex'}`}>
          <div className="border-b border-brand-border bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-accent">Conversations</p>
                <h2 className="!m-0 mt-1 text-[24px] font-bold tracking-[-0.025em] !text-brand-primary">Messages</h2>
              </div>
              <span className="rounded-full border border-brand-border bg-brand-bg px-3 py-1.5 text-[10px] font-bold text-brand-primary">{conversations.length} Active</span>
            </div>
            <p className="mt-2 text-[12px] leading-5 text-brand-textMuted">Message TruCity Admin or reply to an employer who has contacted you.</p>
            <button type="button" onClick={() => void handleStartAdminConversation()} disabled={isStartingAdminChat} className="mt-4 flex min-h-[40px] w-full items-center justify-center gap-2 rounded-[12px] px-3 text-[12px] font-bold text-white transition-opacity disabled:cursor-wait disabled:opacity-60" style={{ background: 'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)' }}>
              <MessageCircle className="h-4 w-4" />
              {isStartingAdminChat ? 'Connecting to Admin…' : 'Contact TruCity Admin'}
            </button>
          </div>

          {loadError && <div role="alert" className="mx-3 mt-3 rounded-[12px] border border-brand-crimson/30 bg-brand-crimson/5 p-3 text-[12px] leading-5 text-brand-crimson">{loadError}<button type="button" onClick={() => void loadConversations(activeId)} className="ml-2 inline-flex items-center gap-1 font-bold underline"><RefreshCw className="h-3 w-3" /> Retry</button></div>}

          <div className="flex-1 overflow-y-auto p-3">
            {isLoading ? <div className="p-5 text-center text-[12px] text-brand-textMuted">Loading conversations…</div> : conversations.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-[16px] bg-brand-accent/10 text-brand-primary"><MessageCircle className="h-5 w-5" /></div>
                <p className="mt-3 text-[13px] font-bold text-brand-primary">No conversations yet</p>
                <p className="mt-1 text-[11px] leading-5 text-brand-textMuted">Start by contacting TruCity Admin. Employers can contact you through your TruCity profile.</p>
              </div>
            ) : <div className="space-y-2">{conversations.map((conversation) => {
              const isActive = activeId === conversation.id;
              const verified = conversation.participantType === 'EMPLOYER';
              return <button key={conversation.id} type="button" onClick={() => handleSelectConversation(conversation)} className={`flex w-full items-start gap-3 rounded-[18px] border p-3.5 text-left transition-all duration-200 ${isActive ? 'border-brand-accent/35 bg-brand-accent/10 shadow-[0_8px_18px_rgba(0,70,109,0.07)]' : 'border-transparent bg-white hover:border-brand-border hover:bg-brand-bg'} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/15`}>
                <CompanyAvatar name={conversation.participantName || 'Conversation'} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5"><span className="truncate text-[12px] font-bold text-brand-primary">{conversation.participantName || 'Conversation'}</span>{verified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brand-emerald" />}</div>
                    <span className="shrink-0 text-[10px] text-brand-textMuted">{formatTime(conversation.lastMessageAt)}</span>
                  </div>
                  <p className="mt-1 truncate text-[11px] leading-5 text-brand-textMuted">{conversation.lastMessage || 'No messages yet. Say hello.'}</p>
                  <div className="mt-2 flex items-center justify-between"><span className="text-[10px] font-bold text-brand-primary">{conversation.participantType === 'ADMIN' ? 'TruCity Admin' : conversation.participantType === 'EMPLOYER' ? 'Employer' : conversation.participantRole || conversation.participantType}</span>{conversation.unreadCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-dark">{conversation.unreadCount}</span>}</div>
                </div>
              </button>;
            })}</div>}
          </div>
        </aside>

        <section className={`min-w-0 flex-1 flex-col bg-brand-bg/90 ${!showMobileList ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex min-h-[78px] items-center gap-4 border-b border-brand-border bg-white px-4 py-3 sm:px-5">
            <button type="button" onClick={() => setShowMobileList(true)} aria-label="Back to conversations" className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-brand-border bg-white text-brand-textMuted transition-colors hover:border-brand-primary hover:text-brand-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/20 md:hidden"><ChevronLeft className="h-4 w-4" /></button>
            {activeConversation ? <>
              <CompanyAvatar name={activeConversation.participantName || 'Conversation'} />
              <div className="min-w-0"><div className="flex items-center gap-1.5"><h3 className="!m-0 truncate text-[18px] font-bold !text-brand-primary">{activeConversation.participantName}</h3>{isEmployerConversation && <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-emerald" />}</div><span className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-brand-primary"><span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" />{isAdminConversation ? 'TruCity Support' : isEmployerConversation ? 'Employer conversation' : activeConversation.participantRole || activeConversation.participantType}</span></div>
            </> : <div><h3 className="!m-0 text-[18px] font-bold !text-brand-primary">Your messages</h3><p className="mt-1 text-[11px] text-brand-textMuted">Choose a conversation or contact TruCity Admin.</p></div>}
          </div>

          {notice && <div className="border-b border-brand-accent/25 bg-brand-accent/10 px-5 py-3 text-[12px] font-semibold leading-5 text-brand-primary">{notice}</div>}
          {threadError && <div role="alert" className="border-b border-brand-crimson/20 bg-brand-crimson/5 px-5 py-3 text-[12px] text-brand-crimson">{threadError}<button type="button" onClick={() => activeId && void loadActiveMessages(activeId)} className="ml-2 font-bold underline">Retry</button></div>}

          <div ref={messageStreamRef} className="flex-1 overflow-y-auto bg-transparent p-4 sm:p-5">
            {!activeConversation ? <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center"><div className="grid h-14 w-14 place-items-center rounded-[18px] bg-brand-accent/10 text-brand-primary"><Send className="h-6 w-6" /></div><h4 className="!m-0 mt-4 text-[18px] font-bold !text-brand-primary">Start with TruCity Admin</h4><p className="mt-2 max-w-[340px] text-[12px] leading-5 text-brand-textMuted">Candidates can initiate conversations with Admin only. Use Contact TruCity Admin to begin.</p><button type="button" onClick={() => void handleStartAdminConversation()} disabled={isStartingAdminChat} className="mt-4 rounded-[12px] px-4 py-2.5 text-[12px] font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)' }}>{isStartingAdminChat ? 'Connecting…' : 'Contact TruCity Admin'}</button></div> : isLoadingMessages ? <div className="flex h-full min-h-[250px] items-center justify-center text-[12px] text-brand-textMuted">Loading messages…</div> : messages.length === 0 ? <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center"><div className="grid h-14 w-14 place-items-center rounded-[18px] bg-brand-accent/10 text-brand-primary"><Send className="h-6 w-6" /></div><h4 className="!m-0 mt-4 text-[18px] font-bold !text-brand-primary">Start the conversation</h4><p className="mt-2 max-w-[340px] text-[12px] leading-5 text-brand-textMuted">Send a message to {activeConversation.participantName} to begin the conversation.</p></div> : <div className="space-y-4">{messages.map((message) => {
              const isMine = message.senderType.toUpperCase() === 'CANDIDATE';
              return <div key={message.id} className={`flex max-w-[92%] flex-col sm:max-w-[78%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}><div className={`rounded-[18px] border px-4 py-3 text-[14px] leading-6 shadow-sm ${isMine ? 'rounded-br-[6px] border-brand-primary bg-brand-primary text-white' : 'rounded-bl-[6px] border-brand-border bg-white text-brand-text'}`}><p className="whitespace-pre-wrap break-words">{message.text}</p></div><span className="mt-1 flex items-center gap-1 px-1 text-[10px] text-brand-textMuted"><Clock className="h-2.5 w-2.5" />{formatTime(message.createdAt)}{isMine && message.readAt && <span className="ml-1">· Read</span>}</span></div>;
            })}</div>}
          </div>

          <div className="border-t border-brand-border bg-white p-4">
            {sendError && <p role="alert" className="mb-3 text-[12px] font-semibold text-brand-crimson">{sendError}</p>}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input ref={draftRef} type="text" value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!activeConversation || isSending || isLoadingMessages} maxLength={5000} placeholder={activeConversation ? `Message ${activeConversation.participantName}…` : 'Select a conversation to message…'} className="min-h-[46px] flex-1 rounded-[14px] border border-brand-border bg-brand-bg px-4 text-[14px] font-normal text-brand-text outline-none transition-all duration-200 placeholder:text-brand-textMuted/70 hover:border-brand-accent/60 focus:border-brand-accent focus:bg-white focus:ring-4 focus:ring-brand-accent/10 disabled:cursor-not-allowed disabled:opacity-60" />
              <button type="submit" disabled={!draft.trim() || !activeConversation || isSending || isLoadingMessages} className="flex min-h-[46px] items-center justify-center gap-2 rounded-[14px] px-4 text-[12px] font-bold text-white shadow-[0_8px_20px_rgba(0,70,109,0.16)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-brand-border disabled:text-brand-textMuted disabled:shadow-none disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/25" style={!draft.trim() || !activeConversation || isSending ? undefined : { background: 'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)' }}><Send className="h-4 w-4" /><span className="hidden sm:inline">{isSending ? 'Sending…' : 'Send'}</span></button>
            </form>
            <p className="mt-2 text-[10px] leading-4 text-brand-textMuted">Messages are saved to your TruCity account. Do not include passwords or sensitive personal information.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function CompanyAvatar({ name }: { name: string }) {
  return <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/70 text-[14px] font-bold text-white shadow-[0_7px_16px_rgba(0,70,109,0.13)]" style={{ background: 'linear-gradient(135deg, #00466D 0%, #1E92D2 100%)' }}>{name.trim().charAt(0).toUpperCase() || 'T'}</div>;
}

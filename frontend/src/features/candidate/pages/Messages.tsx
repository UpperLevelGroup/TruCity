import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';

import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  Paperclip,
  Send,
  Trash2,
  Video,
  X,
} from 'lucide-react';

import {
  useLocation,
} from 'react-router-dom';

import {
  useNotifications,
} from '../../../context/NotificationsContext';

/* =========================================================
   TYPES
========================================================= */

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  verified: boolean;
  unreadCount?: number;
}

type InterviewStatus =
  | 'pending'
  | 'accepted'
  | 'declined';

type InterviewFormat =
  | 'Video Interview'
  | 'Phone Interview'
  | 'In-Person Interview';

interface InterviewDetails {
  interviewId: string;
  jobTitle: string;
  scheduledAt: string;
  duration: string;
  format: InterviewFormat;
  location?: string;
  status: InterviewStatus;
}

interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  kind: 'cv';
}

interface MessageItem {
  id: string;
  conversationId: string;
  from: string;
  text: string;
  time: string;
  interview?: InterviewDetails;
  attachment?: MessageAttachment;
}

interface MessageRouteState {
  source?: 'company-contact';
  company?: string;
  allowCvAttachment?: boolean;
}

/* =========================================================
   STATIC DATA
========================================================= */

const CONVERSATIONS: Conversation[] = [
  {
    id: 'apex',
    name: 'Apex Tech Solutions',
    lastMessage:
      'Interview invitation for Senior Java Engineer.',
    time: '09:22',
    verified: true,
    unreadCount: 1,
  },

  {
    id: 'vanguard',
    name: 'Vanguard Logistics Hub',
    lastMessage:
      'Thanks for your application. We will review it shortly.',
    time: 'Yesterday',
    verified: true,
  },

  {
    id: 'innovate',
    name: 'Innovate Digital Corp',
    lastMessage:
      'Your application has been shortlisted!',
    time: '2d ago',
    verified: true,
  },
];

const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: '1',
    conversationId: 'apex',
    from: 'Apex Tech Solutions',
    text:
      'Hi! We reviewed your TruCity profile and application. We would like to invite you to an introductory technical interview.',
    time: '09:15',
  },

  {
    id: '2',
    conversationId: 'apex',
    from: 'You',
    text:
      'Hello! Thank you for considering my application.',
    time: '09:18',
  },

  {
    id: '3',
    conversationId: 'apex',
    from: 'Apex Tech Solutions',
    text:
      'We would like to invite you to an interview for the Senior Java Engineer position.',
    time: '09:22',

    interview: {
      interviewId:
        'interview-apex-001',

      jobTitle:
        'Senior Java Engineer',

      scheduledAt:
        '2026-09-10T10:00:00',

      duration:
        '45 minutes',

      format:
        'Video Interview',

      status:
        'pending',
    },
  },

  {
    id: '4',
    conversationId: 'vanguard',
    from: 'Vanguard Logistics Hub',
    text:
      'Thanks for your application. We will review your TruCity profile shortly.',
    time: 'Yesterday',
  },

  {
    id: '5',
    conversationId: 'innovate',
    from: 'Innovate Digital Corp',
    text:
      'Your application has been shortlisted. We will be in touch with next steps.',
    time: '2d ago',
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getConversationIdFromCompany(
  company?: string,
) {
  if (!company) {
    return CONVERSATIONS[0].id;
  }

  const match =
    CONVERSATIONS.find(
      (conversation) =>
        conversation.name
          .toLowerCase()
          .trim() ===
        company
          .toLowerCase()
          .trim(),
    );

  return (
    match?.id ??
    CONVERSATIONS[0].id
  );
}

function formatFileSize(
  bytes: number,
) {
  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }

  const kilobytes =
    bytes /
    1024;

  if (
    kilobytes <
    1024
  ) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(
    kilobytes /
    1024
  ).toFixed(1)} MB`;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Messages() {
  const location =
    useLocation();

  const {
    addNotification,
  } = useNotifications();

  const routeState =
    location.state as
      | MessageRouteState
      | null;

  const initialConversationId =
    getConversationIdFromCompany(
      routeState?.company,
    );

  const cvInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    activeId,
    setActiveId,
  ] =
    useState<string>(
      initialConversationId,
    );

  const [
    conversations,
  ] =
    useState<Conversation[]>(
      CONVERSATIONS,
    );

  const [
    messages,
    setMessages,
  ] =
    useState<MessageItem[]>(
      INITIAL_MESSAGES,
    );

  const [
    draft,
    setDraft,
  ] =
    useState('');

  const [
    showMobileList,
    setShowMobileList,
  ] =
    useState(
      !routeState?.company,
    );

  const [
    attachedCv,
    setAttachedCv,
  ] =
    useState<File | null>(
      null,
    );

  const [
    cvError,
    setCvError,
  ] =
    useState('');

  /* =========================================================
     ROUTE STATE SYNC
  ========================================================= */

  useEffect(() => {
    if (
      !routeState?.company
    ) {
      return;
    }

    const conversationId =
      getConversationIdFromCompany(
        routeState.company,
      );

    setActiveId(
      conversationId,
    );

    setShowMobileList(
      false,
    );

    setAttachedCv(
      null,
    );

    setCvError('');
  }, [
    routeState?.company,
  ]);

  /* =========================================================
     ACTIVE CONVERSATION
  ========================================================= */

  const activeConv =
    conversations.find(
      (conversation) =>
        conversation.id ===
        activeId,
    ) ??
    conversations[0];

  const activeMessages =
    useMemo(
      () =>
        messages.filter(
          (message) =>
            message.conversationId ===
            activeId,
        ),
      [
        messages,
        activeId,
      ],
    );

  /* =========================================================
     COMPANY CONTACT CONTEXT

     Applying remains separate from Messages.

     CompanyFeed:
     Express Interest -> application submitted.

     Messages:
     communication -> optional CV attachment -> interviews.
  ========================================================= */

  const showCompanyContactContext =
    routeState?.source ===
      'company-contact' &&
    routeState?.company ===
      activeConv.name;

  const allowCvAttachment =
    Boolean(
      routeState?.allowCvAttachment,
    ) &&
    routeState?.company ===
      activeConv.name;

  /* =========================================================
     CV ATTACHMENT
  ========================================================= */

  const handleCvChange = (
    event:
      ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    setCvError('');

    if (!file) {
      return;
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const allowedExtension =
      /\.(pdf|doc|docx)$/i.test(
        file.name,
      );

    if (
      !allowedMimeTypes.includes(
        file.type,
      ) &&
      !allowedExtension
    ) {
      setCvError(
        'Please upload your CV as a PDF, DOC or DOCX file.',
      );

      event.target.value =
        '';

      return;
    }

    const maximumFileSize =
      10 *
      1024 *
      1024;

    if (
      file.size >
      maximumFileSize
    ) {
      setCvError(
        'Your CV must be 10 MB or smaller.',
      );

      event.target.value =
        '';

      return;
    }

    setAttachedCv(
      file,
    );
  };

  const removeAttachedCv =
    () => {
      setAttachedCv(
        null,
      );

      setCvError('');

      if (
        cvInputRef.current
      ) {
        cvInputRef.current.value =
          '';
      }
    };

  /* =========================================================
     SEND MESSAGE / OPTIONAL CV
  ========================================================= */

  const handleSend = () => {
    const trimmed =
      draft.trim();

    if (
      !trimmed &&
      !attachedCv
    ) {
      return;
    }

    const attachment:
      MessageAttachment | undefined =
      attachedCv
        ? {
            id:
              `${Date.now()}-cv`,

            name:
              attachedCv.name,

            size:
              attachedCv.size,

            type:
              attachedCv.type ||
              'application/octet-stream',

            kind:
              'cv',
          }
        : undefined;

    const newMessage:
      MessageItem = {
        id:
          `${Date.now()}-${Math.random()}`,

        conversationId:
          activeId,

        from:
          'You',

        text:
          trimmed,

        time:
          new Date().toLocaleTimeString(
            [],
            {
              hour:
                '2-digit',

              minute:
                '2-digit',
            },
          ),

        attachment,
      };

    setMessages(
      (previous) => [
        ...previous,
        newMessage,
      ],
    );

    /*
     * Production backend:
     *
     * If attachment exists:
     * 1. Upload the actual CV to private Supabase Storage.
     * 2. Store only the storage path / metadata on the message.
     * 3. Insert the message into the messages table.
     * 4. Use signed URLs when an authorised user needs access.
     */

    setDraft('');

    setAttachedCv(
      null,
    );

    setCvError('');

    if (
      cvInputRef.current
    ) {
      cvInputRef.current.value =
        '';
    }
  };

  /* =========================================================
     INTERVIEW RESPONSE
  ========================================================= */

  const handleInterviewResponse = (
    messageId: string,
    response:
      | 'accepted'
      | 'declined',
  ) => {
    const interviewMessage =
      messages.find(
        (message) =>
          message.id ===
          messageId,
      );

    if (
      !interviewMessage?.interview ||
      interviewMessage.interview
        .status !== 'pending'
    ) {
      return;
    }

    const interview =
      interviewMessage.interview;

    const responseMessage:
      MessageItem = {
        id:
          `${Date.now()}-interview-response`,

        conversationId:
          interviewMessage.conversationId,

        from:
          'You',

        text:
          response ===
          'accepted'
            ? `I have accepted the interview invitation for ${interview.jobTitle}. Thank you.`
            : `I am unable to attend the proposed interview for ${interview.jobTitle}.`,

        time:
          new Date().toLocaleTimeString(
            [],
            {
              hour:
                '2-digit',

              minute:
                '2-digit',
            },
          ),
      };

    setMessages(
      (current) => [
        ...current.map(
          (message) =>
            message.id ===
              messageId &&
            message.interview
              ? {
                  ...message,

                  interview: {
                    ...message.interview,

                    status:
                      response,
                  },
                }
              : message,
        ),

        responseMessage,
      ],
    );

    addNotification({
      type:
        'system',

      title:
        response ===
        'accepted'
          ? 'Interview accepted'
          : 'Interview declined',

      message:
        response ===
        'accepted'
          ? `You accepted the interview with ${interviewMessage.from} for ${interview.jobTitle}.`
          : `You declined the interview with ${interviewMessage.from} for ${interview.jobTitle}.`,

      time:
        'Just now',

      read:
        false,

      destination:
        '/candidate/messages',
    });

    /*
     * Production backend:
     *
     * Update the SAME employer-created interview:
     *
     * interview.id = interview.interviewId
     * status = response
     */
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div
      className="
        relative
        min-h-[calc(100dvh-88px)]
        overflow-x-hidden
        bg-transparent
        px-4
        py-6
        font-sans
        text-brand-text

        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          relative
          z-10
          mx-auto
          flex
          h-[calc(100dvh-136px)]
          min-h-[620px]
          w-full
          max-w-[1480px]
          overflow-hidden
          rounded-[28px]
          border
          border-brand-border
          bg-white/95
          shadow-[0_22px_55px_rgba(0,70,109,0.10)]
          backdrop-blur-sm
        "
      >
        {/* =====================================================
            CONVERSATION LIST
        ====================================================== */}

        <aside
          className={`
            w-full
            shrink-0
            flex-col
            border-r
            border-brand-border
            bg-white/95

            md:w-[340px]
            lg:w-[380px]

            ${
              showMobileList
                ? 'flex'
                : 'hidden md:flex'
            }
          `}
        >
          <div
            className="
              border-b
              border-brand-border
              bg-white
              p-5
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-brand-accent
                  "
                >
                  Conversations
                </p>

                <h2
                  className="
                    !m-0
                    mt-1
                    text-[24px]
                    font-bold
                    tracking-[-0.025em]
                    !text-brand-primary
                  "
                >
                  Messages
                </h2>
              </div>

              <span
                className="
                  rounded-full
                  border
                  border-brand-border
                  bg-brand-bg
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  text-brand-primary
                "
              >
                {conversations.length}{' '}
                Active
              </span>
            </div>

            <p
              className="
                mt-2
                text-[12px]
                leading-5
                text-brand-textMuted
              "
            >
              Connect directly with verified employers.
            </p>
          </div>

          <div
            className="
              flex-1
              overflow-y-auto
              p-3
            "
          >
            <div className="space-y-2">
              {conversations.map(
                (
                  conversation,
                ) => {
                  const isActive =
                    activeId ===
                    conversation.id;

                  return (
                    <button
                      key={
                        conversation.id
                      }
                      type="button"
                      onClick={() => {
                        setActiveId(
                          conversation.id,
                        );

                        setShowMobileList(
                          false,
                        );

                        setAttachedCv(
                          null,
                        );

                        setCvError('');
                      }}
                      className={`
                        flex
                        w-full
                        items-start
                        gap-3
                        rounded-[18px]
                        border
                        p-3.5
                        text-left
                        transition-all
                        duration-200

                        ${
                          isActive
                            ? `
                              border-brand-accent/35
                              bg-brand-accent/10
                              shadow-[0_8px_18px_rgba(0,70,109,0.07)]
                            `
                            : `
                              border-transparent
                              bg-white

                              hover:border-brand-border
                              hover:bg-brand-bg
                            `
                        }

                        focus-visible:outline-none
                        focus-visible:ring-4
                        focus-visible:ring-brand-accent/15
                      `}
                    >
                      <CompanyAvatar
                        name={
                          conversation.name
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-2
                          "
                        >
                          <div
                            className="
                              flex
                              min-w-0
                              items-center
                              gap-1.5
                            "
                          >
                            <span
                              className="
                                truncate
                                text-[12px]
                                font-bold
                                text-brand-primary
                              "
                            >
                              {
                                conversation.name
                              }
                            </span>

                            {conversation.verified && (
                              <CheckCircle2
                                className="
                                  h-3.5
                                  w-3.5
                                  shrink-0
                                  text-brand-emerald
                                "
                              />
                            )}
                          </div>

                          <span
                            className="
                              shrink-0
                              text-[10px]
                              font-normal
                              text-brand-textMuted
                            "
                          >
                            {
                              conversation.time
                            }
                          </span>
                        </div>

                        <p
                          className="
                            mt-1
                            truncate
                            text-[11px]
                            leading-5
                            text-brand-textMuted
                          "
                        >
                          {
                            conversation.lastMessage
                          }
                        </p>

                        <div
                          className="
                            mt-2
                            flex
                            items-center
                            justify-between
                          "
                        >
                          <span
                            className="
                              flex
                              items-center
                              gap-1
                              text-[10px]
                              font-bold
                              text-brand-primary
                            "
                          >
                            <CheckCircle2
                              className="
                                h-3
                                w-3
                                text-brand-emerald
                              "
                            />

                            Verified
                          </span>

                          {Boolean(
                            conversation.unreadCount,
                          ) && (
                            <span
                              className="
                                grid
                                h-5
                                min-w-5
                                place-items-center
                                rounded-full
                                bg-brand-gold
                                px-1
                                text-[10px]
                                font-bold
                                text-brand-dark
                              "
                            >
                              {
                                conversation.unreadCount
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </aside>

        {/* =====================================================
            MESSAGE THREAD
        ====================================================== */}

        <section
          className={`
            min-w-0
            flex-1
            flex-col
            bg-brand-bg/90

            ${
              !showMobileList
                ? 'flex'
                : 'hidden md:flex'
            }
          `}
        >
          {/* =================================================
              THREAD HEADER
          ================================================== */}

          <div
            className="
              flex
              min-h-[78px]
              items-center
              gap-4
              border-b
              border-brand-border
              bg-white
              px-4
              py-3

              sm:px-5
            "
          >
            <button
              type="button"
              onClick={() =>
                setShowMobileList(
                  true,
                )
              }
              aria-label="Back to conversations"
              className="
                grid
                h-9
                w-9
                shrink-0
                place-items-center
                rounded-[12px]
                border
                border-brand-border
                bg-white
                text-brand-textMuted
                transition-colors

                hover:border-brand-primary
                hover:text-brand-primary

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/20

                md:hidden
              "
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <CompanyAvatar
              name={
                activeConv.name
              }
            />

            <div className="min-w-0">
              <div
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <h3
                  className="
                    !m-0
                    truncate
                    text-[18px]
                    font-bold
                    !text-brand-primary
                  "
                >
                  {
                    activeConv.name
                  }
                </h3>

                {activeConv.verified && (
                  <CheckCircle2
                    className="
                      h-4
                      w-4
                      shrink-0
                      text-brand-emerald
                    "
                  />
                )}
              </div>

              <span
                className="
                  mt-1
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  font-bold
                  text-brand-primary
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-brand-emerald
                  "
                />

                Active &amp; Verified Employer
              </span>
            </div>
          </div>

          {/* =================================================
              COMPANY CONTACT CONTEXT
          ================================================== */}

          {showCompanyContactContext && (
            <div
              className="
                border-b
                border-brand-accent/25
                bg-brand-accent/10
                px-5
                py-3
                text-[12px]
                font-semibold
                leading-5
                text-brand-primary
              "
            >
              You opened this conversation from the company profile.
              You can send a message or attach your CV below.
            </div>
          )}

          {/* =================================================
              MESSAGE STREAM
          ================================================== */}

          <div
            className="
              flex-1
              overflow-y-auto
              bg-transparent
              p-4

              sm:p-5
            "
          >
            {activeMessages.length ===
            0 ? (
              <div
                className="
                  flex
                  h-full
                  min-h-[300px]
                  flex-col
                  items-center
                  justify-center
                  text-center
                "
              >
                <div
                  className="
                    grid
                    h-14
                    w-14
                    place-items-center
                    rounded-[18px]
                    bg-brand-accent/10
                    text-brand-primary
                  "
                >
                  <Send className="h-6 w-6" />
                </div>

                <h4
                  className="
                    !m-0
                    mt-4
                    text-[18px]
                    font-bold
                    !text-brand-primary
                  "
                >
                  Start the conversation
                </h4>

                <p
                  className="
                    mt-2
                    max-w-[340px]
                    text-[12px]
                    leading-5
                    text-brand-textMuted
                  "
                >
                  Send a message to{' '}
                  {activeConv.name} to begin the conversation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMessages.map(
                  (
                    message,
                  ) => {
                    const isMe =
                      message.from ===
                      'You';

                    return (
                      <div
                        key={
                          message.id
                        }
                        className={`
                          flex
                          max-w-[92%]
                          flex-col

                          sm:max-w-[78%]

                          ${
                            isMe
                              ? 'ml-auto items-end'
                              : 'mr-auto items-start'
                          }
                        `}
                      >
                        <div
                          className={`
                            rounded-[18px]
                            border
                            px-4
                            py-3
                            text-[14px]
                            leading-6
                            shadow-sm

                            ${
                              isMe
                                ? `
                                  rounded-br-[6px]
                                  border-brand-primary
                                  bg-brand-primary
                                  text-white
                                `
                                : `
                                  rounded-bl-[6px]
                                  border-brand-border
                                  bg-white
                                  text-brand-text
                                `
                            }
                          `}
                        >
                          {message.text && (
                            <p className="whitespace-pre-wrap">
                              {
                                message.text
                              }
                            </p>
                          )}

                          {message.attachment && (
                            <SentAttachment
                              attachment={
                                message.attachment
                              }
                              isMine={
                                isMe
                              }
                            />
                          )}

                          {message.interview && (
                            <InterviewInvitationCard
                              interview={
                                message.interview
                              }
                              onAccept={() =>
                                handleInterviewResponse(
                                  message.id,
                                  'accepted',
                                )
                              }
                              onDecline={() =>
                                handleInterviewResponse(
                                  message.id,
                                  'declined',
                                )
                              }
                            />
                          )}
                        </div>

                        <span
                          className="
                            mt-1
                            flex
                            items-center
                            gap-1
                            px-1
                            text-[10px]
                            text-brand-textMuted
                          "
                        >
                          <Clock className="h-2.5 w-2.5" />

                          {
                            message.time
                          }
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>

          {/* =================================================
              MESSAGE COMPOSER
          ================================================== */}

          <div
            className="
              border-t
              border-brand-border
              bg-white
              p-4
            "
          >
            {allowCvAttachment && (
              <input
                ref={
                  cvInputRef
                }
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={
                  handleCvChange
                }
                className="hidden"
              />
            )}

            {attachedCv && (
              <div
                className="
                  mb-3
                  flex
                  items-center
                  justify-between
                  gap-3
                  rounded-[14px]
                  border
                  border-brand-border
                  bg-brand-bg
                  px-3
                  py-2.5
                "
              >
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      grid
                      h-10
                      w-10
                      shrink-0
                      place-items-center
                      rounded-[11px]
                      bg-brand-accent/10
                      text-brand-primary
                    "
                  >
                    <FileText className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-[12px]
                        font-bold
                        text-brand-primary
                      "
                    >
                      {
                        attachedCv.name
                      }
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[10px]
                        text-brand-textMuted
                      "
                    >
                      {formatFileSize(
                        attachedCv.size,
                      )}{' '}
                      • CV ready to send
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    removeAttachedCv
                  }
                  aria-label="Remove attached CV"
                  className="
                    grid
                    h-9
                    w-9
                    shrink-0
                    place-items-center
                    rounded-[10px]
                    text-brand-textMuted
                    transition-colors

                    hover:bg-white
                    hover:text-brand-crimson

                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-brand-crimson/15
                  "
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}

            {cvError && (
              <p
                className="
                  mb-3
                  text-[12px]
                  font-semibold
                  text-brand-crimson
                "
              >
                {cvError}
              </p>
            )}

            <form
              onSubmit={(
                event,
              ) => {
                event.preventDefault();

                handleSend();
              }}
              className="
                flex
                items-center
                gap-2
              "
            >
              {allowCvAttachment && (
                <button
                  type="button"
                  onClick={() =>
                    cvInputRef.current?.click()
                  }
                  title="Attach CV"
                  aria-label="Attach CV"
                  className={`
                    grid
                    h-[46px]
                    w-[46px]
                    shrink-0
                    place-items-center
                    rounded-[14px]
                    border
                    transition-all
                    duration-200

                    ${
                      attachedCv
                        ? `
                          border-brand-accent
                          bg-brand-accent/10
                          text-brand-primary
                        `
                        : `
                          border-brand-border
                          bg-white
                          text-brand-textMuted

                          hover:border-brand-accent
                          hover:bg-brand-accent/10
                          hover:text-brand-primary
                        `
                    }

                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-brand-accent/20
                  `}
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              )}

              <input
                type="text"
                value={
                  draft
                }
                onChange={(
                  event,
                ) =>
                  setDraft(
                    event.target
                      .value,
                  )
                }
                placeholder={
                  attachedCv
                    ? 'Add a message with your CV...'
                    : `Message ${activeConv.name}...`
                }
                className="
                  min-h-[46px]
                  flex-1
                  rounded-[14px]
                  border
                  border-brand-border
                  bg-brand-bg
                  px-4
                  text-[14px]
                  font-normal
                  text-brand-text
                  outline-none
                  transition-all
                  duration-200

                  placeholder:text-brand-textMuted/70

                  hover:border-brand-accent/60

                  focus:border-brand-accent
                  focus:bg-white
                  focus:ring-4
                  focus:ring-brand-accent/10
                "
              />

              <button
                type="submit"
                disabled={
                  !draft.trim() &&
                  !attachedCv
                }
                className="
                  flex
                  min-h-[46px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[14px]
                  px-4
                  text-[12px]
                  font-bold
                  text-white
                  shadow-[0_8px_20px_rgba(0,70,109,0.16)]
                  transition-all
                  duration-200

                  hover:-translate-y-0.5

                  disabled:cursor-not-allowed
                  disabled:bg-brand-border
                  disabled:text-brand-textMuted
                  disabled:shadow-none
                  disabled:hover:translate-y-0

                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-brand-accent/25
                "
                style={
                  !draft.trim() &&
                  !attachedCv
                    ? undefined
                    : {
                        background:
                          'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
                      }
                }
              >
                <Send className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Send
                </span>
              </button>
            </form>

            {allowCvAttachment && (
              <p
                className="
                  mt-2
                  text-[10px]
                  leading-4
                  text-brand-textMuted
                "
              >
                Attach CV supports PDF, DOC and DOCX files up to 10 MB.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   COMPANY AVATAR
========================================================= */

interface CompanyAvatarProps {
  name: string;
}

function CompanyAvatar({
  name,
}: CompanyAvatarProps) {
  return (
    <div
      className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-[14px]
        border
        border-white/70
        text-[14px]
        font-bold
        text-white
        shadow-[0_7px_16px_rgba(0,70,109,0.13)]
      "
      style={{
        background:
          'linear-gradient(135deg, #00466D 0%, #1E92D2 100%)',
      }}
    >
      {name.charAt(0)}
    </div>
  );
}

/* =========================================================
   SENT CV ATTACHMENT
========================================================= */

interface SentAttachmentProps {
  attachment: MessageAttachment;
  isMine: boolean;
}

function SentAttachment({
  attachment,
  isMine,
}: SentAttachmentProps) {
  return (
    <div
      className={`
        mt-3
        flex
        min-w-0
        items-center
        gap-3
        rounded-[13px]
        border
        p-3

        sm:min-w-[280px]

        ${
          isMine
            ? `
              border-white/25
              bg-white/10
            `
            : `
              border-brand-border
              bg-brand-bg
            `
        }
      `}
    >
      <div
        className={`
          grid
          h-10
          w-10
          shrink-0
          place-items-center
          rounded-[11px]

          ${
            isMine
              ? `
                bg-white/15
                text-white
              `
              : `
                bg-brand-accent/10
                text-brand-primary
              `
          }
        `}
      >
        <FileText className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p
          className={`
            truncate
            text-[12px]
            font-bold

            ${
              isMine
                ? 'text-white'
                : 'text-brand-primary'
            }
          `}
        >
          {
            attachment.name
          }
        </p>

        <p
          className={`
            mt-0.5
            text-[10px]

            ${
              isMine
                ? 'text-white/70'
                : 'text-brand-textMuted'
            }
          `}
        >
          CV •{' '}

          {formatFileSize(
            attachment.size,
          )}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   INTERVIEW INVITATION
========================================================= */

interface InterviewInvitationCardProps {
  interview: InterviewDetails;
  onAccept: () => void;
  onDecline: () => void;
}

function InterviewInvitationCard({
  interview,
  onAccept,
  onDecline,
}: InterviewInvitationCardProps) {
  const interviewDate =
    new Date(
      interview.scheduledAt,
    );

  const formattedDate =
    interviewDate.toLocaleDateString(
      'en-ZA',
      {
        weekday:
          'long',

        day:
          'numeric',

        month:
          'long',

        year:
          'numeric',
      },
    );

  const formattedTime =
    interviewDate.toLocaleTimeString(
      'en-ZA',
      {
        hour:
          '2-digit',

        minute:
          '2-digit',
      },
    );

  const isPending =
    interview.status ===
    'pending';

  const isAccepted =
    interview.status ===
    'accepted';

  return (
    <div
      className="
        mt-3
        min-w-0
        overflow-hidden
        rounded-[16px]
        border
        border-brand-border
        bg-white
        text-brand-text
        shadow-sm

        sm:min-w-[340px]
      "
    >
      <div
        className="
          border-b
          border-brand-border
          bg-brand-accent/10
          p-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <CalendarDays
            className="
              h-4
              w-4
              text-brand-primary
            "
          />

          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-brand-primary
            "
          >
            Interview Invitation
          </span>
        </div>

        <h4
          className="
            !m-0
            mt-2
            text-[16px]
            font-bold
            !text-brand-primary
          "
        >
          {
            interview.jobTitle
          }
        </h4>
      </div>

      <div className="space-y-3 p-4">
        <div
          className="
            flex
            items-start
            gap-2.5
            text-[12px]
            text-brand-textMuted
          "
        >
          <CalendarDays
            className="
              mt-0.5
              h-4
              w-4
              shrink-0
              text-brand-accent
            "
          />

          <div>
            <p
              className="
                font-bold
                text-brand-text
              "
            >
              {
                formattedDate
              }
            </p>

            <p className="mt-0.5">
              {
                formattedTime
              }
            </p>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-2.5
            text-[12px]
            text-brand-textMuted
          "
        >
          <Clock
            className="
              h-4
              w-4
              shrink-0
              text-brand-accent
            "
          />

          {
            interview.duration
          }
        </div>

        <div
          className="
            flex
            items-center
            gap-2.5
            text-[12px]
            text-brand-textMuted
          "
        >
          <Video
            className="
              h-4
              w-4
              shrink-0
              text-brand-accent
            "
          />

          {
            interview.format
          }
        </div>

        {interview.location && (
          <div
            className="
              rounded-[10px]
              border
              border-brand-border
              bg-brand-bg
              px-3
              py-2
              text-[12px]
              text-brand-textMuted
            "
          >
            {
              interview.location
            }
          </div>
        )}

        {isPending ? (
          <div
            className="
              grid
              grid-cols-2
              gap-2
              pt-1
            "
          >
            <button
              type="button"
              onClick={
                onDecline
              }
              className="
                flex
                min-h-[40px]
                items-center
                justify-center
                gap-2
                rounded-[11px]
                border
                border-brand-border
                bg-white
                px-3
                text-[12px]
                font-bold
                text-brand-textMuted
                transition-colors

                hover:border-brand-crimson
                hover:bg-brand-crimson/5
                hover:text-brand-crimson

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-crimson/15
              "
            >
              <X className="h-3.5 w-3.5" />

              Decline
            </button>

            <button
              type="button"
              onClick={
                onAccept
              }
              className="
                flex
                min-h-[40px]
                items-center
                justify-center
                gap-2
                rounded-[11px]
                px-3
                text-[12px]
                font-bold
                text-white
                shadow-[0_7px_16px_rgba(0,70,109,0.14)]
                transition-all
                duration-200

                hover:-translate-y-0.5

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/25
              "
              style={{
                background:
                  'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
              }}
            >
              <Check className="h-3.5 w-3.5" />

              Accept
            </button>
          </div>
        ) : (
          <div
            className={`
              flex
              items-center
              gap-2
              rounded-[11px]
              border
              px-3
              py-2.5
              text-[12px]
              font-bold

              ${
                isAccepted
                  ? `
                    border-brand-emerald
                    bg-brand-emerald/10
                    text-brand-primary
                  `
                  : `
                    border-brand-crimson
                    bg-brand-crimson/10
                    text-brand-crimson
                  `
              }
            `}
          >
            {isAccepted ? (
              <CheckCircle2
                className="
                  h-4
                  w-4
                  text-brand-emerald
                "
              />
            ) : (
              <X className="h-4 w-4" />
            )}

            Interview{' '}

            {isAccepted
              ? 'accepted'
              : 'declined'}
          </div>
        )}
      </div>
    </div>
  );
}
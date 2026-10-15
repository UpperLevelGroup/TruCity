import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  ImagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Video,
  X,
} from 'lucide-react';

import api from '../../../api/axios';

/* =========================================================
   TYPES
========================================================= */

type HubType =
  | 'STORY'
  | 'NEWS'
  | 'SEMINAR'
  | 'WEBINAR'
  | 'TRAINING'
  | 'VIDEO';

type HubStatus = 'DRAFT' | 'PUBLISHED';

type HubItem = {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  summary: string | null;
  body: string | null;
  contentType: HubType;
  category: string | null;
  eventStartsAt: string | null;
  eventEndsAt: string | null;
  eventLocation: string | null;
  mediaUrl: string | null;
  mediaContentType: string | null;
  mediaOriginalName: string | null;
  status: HubStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  title: string;
  summary: string;
  body: string;
  contentType: HubType;
  category: string;
  eventStartsAt: string;
  eventEndsAt: string;
  eventLocation: string;
};

const blank: FormState = {
  title: '',
  summary: '',
  body: '',
  contentType: 'STORY',
  category: '',
  eventStartsAt: '',
  eventEndsAt: '',
  eventLocation: '',
};

const types: {
  value: HubType;
  label: string;
  description: string;
}[] = [
  {
    value: 'STORY',
    label: 'Company story',
    description: 'Share your organisation’s journey and culture.',
  },
  {
    value: 'NEWS',
    label: 'Company news',
    description: 'Publish announcements and company updates.',
  },
  {
    value: 'SEMINAR',
    label: 'Seminar',
    description: 'Promote an upcoming seminar or session.',
  },
  {
    value: 'WEBINAR',
    label: 'Webinar',
    description: 'Share an online event with professionals.',
  },
  {
    value: 'TRAINING',
    label: 'Training',
    description: 'Promote learning and skills development.',
  },
  {
    value: 'VIDEO',
    label: 'Company video',
    description: 'Showcase your organisation through video.',
  },
];

/* =========================================================
   PAGE-SCOPED STYLES
   Uses the Company Dashboard's existing tc-* design system.
========================================================= */

const HUB_STYLES = `
  .tc-hub {
    width: 100%;
    min-width: 0;
    color: #334155;
  }

  .tc-hub *,
  .tc-hub *::before,
  .tc-hub *::after {
    box-sizing: border-box;
  }

  .tc-hub button,
  .tc-hub input,
  .tc-hub select,
  .tc-hub textarea {
    font: inherit;
  }

  .tc-hub button {
    cursor: pointer;
  }

  .tc-hub .tc-page-heading {
    margin-bottom: 24px;
  }

  .tc-hub-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 27px;
  }

  .tc-hub-stat {
    display: flex;
    align-items: center;
    gap: 13px;
    min-width: 0;
    padding: 17px;
    border: 1px solid #DCE7EF;
    border-radius: 14px;
    background: #FFFFFF;
    box-shadow: 0 3px 12px rgba(15,42,62,.025);
  }

  .tc-hub-stat-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 12px;
    background: #EAF5FC;
    color: #1E92D2;
  }

  .tc-hub-stat-icon.published {
    background: #ECFDF3;
    color: #15803D;
  }

  .tc-hub-stat-icon.draft {
    background: #FFF7E4;
    color: #B77900;
  }

  .tc-hub-stat-label {
    margin-bottom: 5px;
    color: #64748B;
    font-size: 10px;
    font-weight: 700;
  }

  .tc-hub-stat-value {
    color: #00273D;
    font-size: 24px;
    font-weight: 900;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }

  .tc-hub-panel {
    min-width: 0;
    margin-bottom: 25px;
    padding: 22px;
    border: 1px solid #DCE7EF;
    border-radius: 15px;
    background: #FFFFFF;
    box-shadow: 0 3px 12px rgba(15,42,62,.025);
  }

  .tc-hub-panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 22px;
  }

  .tc-hub-panel-heading-main {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
  }

  .tc-hub-panel-icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 11px;
    background: #EAF5FB;
    color: #00466D;
  }

  .tc-hub-panel-title {
    margin: 1px 0 0;
    color: #00273D;
    font-size: 14px;
    font-weight: 900;
    line-height: 1.5;
  }

  .tc-hub-panel-description {
    margin: 5px 0 0;
    color: #64748B;
    font-size: 11px;
    line-height: 1.7;
  }

  .tc-hub-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 17px;
  }

  .tc-hub-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
    color: #334155;
    font-size: 11px;
    font-weight: 800;
  }

  .tc-hub-field.full {
    grid-column: 1 / -1;
  }

  .tc-hub-field-hint {
    color: #94A3B8;
    font-size: 10px;
    font-weight: 400;
    line-height: 1.6;
  }

  .tc-hub-input,
  .tc-hub-select,
  .tc-hub-textarea {
    display: block;
    width: 100%;
    min-width: 0;
    border: 1px solid #DCE7EF;
    border-radius: 10px;
    outline: none;
    background: #FAFCFE;
    color: #334155;
    font-size: 12px;
    font-weight: 400;
    transition: border-color .18s ease, box-shadow .18s ease,
      background .18s ease;
  }

  .tc-hub-input,
  .tc-hub-select {
    min-height: 42px;
    padding: 0 12px;
  }

  .tc-hub-textarea {
    min-height: 100px;
    padding: 11px 12px;
    line-height: 1.7;
    resize: vertical;
  }

  .tc-hub-input:focus,
  .tc-hub-select:focus,
  .tc-hub-textarea:focus {
    border-color: #1E92D2;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(30,146,210,.10);
  }

  .tc-hub-input::placeholder,
  .tc-hub-textarea::placeholder {
    color: #94A3B8;
  }

  .tc-hub-type-preview {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 11px 12px;
    border: 1px solid #DCE7EF;
    border-radius: 10px;
    background: #F8FCFF;
    color: #64748B;
    font-size: 10px;
    line-height: 1.6;
  }

  .tc-hub-type-preview svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: #1E92D2;
  }

  .tc-hub-upload {
    display: flex;
    flex-direction: column;
    gap: 11px;
    padding: 16px;
    border: 1px dashed #B8D3E2;
    border-radius: 12px;
    background: #F8FCFF;
  }

  .tc-hub-upload-top {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .tc-hub-upload-icon {
    display: grid;
    place-items: center;
    width: 39px;
    height: 39px;
    flex-shrink: 0;
    border-radius: 10px;
    background: #EAF5FB;
    color: #00466D;
  }

  .tc-hub-upload-title {
    color: #00273D;
    font-size: 11px;
    font-weight: 800;
  }

  .tc-hub-upload-copy {
    margin-top: 4px;
    color: #64748B;
    font-size: 10px;
    line-height: 1.6;
  }

  .tc-hub-file-input {
    display: block;
    width: 100%;
    min-width: 0;
    color: #64748B;
    font-size: 10px;
  }

  .tc-hub-file-input::file-selector-button {
    margin-right: 10px;
    padding: 8px 11px;
    border: 1px solid #DCE7EF;
    border-radius: 8px;
    background: #FFFFFF;
    color: #00466D;
    font-size: 10px;
    font-weight: 800;
    cursor: pointer;
  }

  .tc-hub-selected-file {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border: 1px solid #D5EADF;
    border-radius: 9px;
    background: #F1FBF5;
    color: #187347;
    font-size: 10px;
    overflow-wrap: anywhere;
  }

  .tc-hub-form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 13px;
    flex-wrap: wrap;
    padding-top: 19px;
    margin-top: 20px;
    border-top: 1px solid #EEF2F6;
  }

  .tc-hub-form-actions-left,
  .tc-hub-form-actions-right {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
  }

  .tc-hub-message {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 19px;
    padding: 13px 15px;
    border: 1px solid #D5EADF;
    border-radius: 11px;
    background: #F1FBF5;
    color: #187347;
    font-size: 11px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .tc-hub-message.error {
    border-color: #FECACA;
    background: #FFF7F7;
    color: #991B1B;
  }

  .tc-hub-message svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .tc-hub-list-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin: 29px 0 15px;
  }

  .tc-hub-list-heading h2 {
    margin: 0;
    color: #00273D;
    font-size: 16px;
    font-weight: 900;
  }

  .tc-hub-list-heading p {
    margin: 6px 0 0;
    color: #64748B;
    font-size: 11px;
    line-height: 1.7;
  }

  .tc-hub-filter-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .tc-hub-filter-tabs {
    display: flex;
    gap: 5px;
    max-width: 100%;
    padding: 4px;
    border: 1px solid #DCE7EF;
    border-radius: 10px;
    background: #FFFFFF;
  }

  .tc-hub-filter {
    min-height: 33px;
    padding: 0 12px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: #64748B;
    font-size: 10px;
    font-weight: 800;
  }

  .tc-hub-filter:hover {
    color: #00466D;
    background: #F4FAFD;
  }

  .tc-hub-filter.active {
    background: #EAF5FB;
    color: #00466D;
  }

  .tc-hub-content-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 17px;
  }

  .tc-hub-item {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    border: 1px solid #DCE7EF;
    border-radius: 14px;
    background: #FFFFFF;
    box-shadow: 0 3px 12px rgba(15,42,62,.025);
    transition: transform .18s ease, box-shadow .18s ease;
  }

  .tc-hub-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 9px 24px rgba(15,42,62,.06);
  }

  .tc-hub-item-media {
    display: block;
    width: 100%;
    max-height: 245px;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    background: #00273D;
  }

  .tc-hub-item-video {
    display: block;
    width: 100%;
    max-height: 245px;
    background: #00273D;
  }

  .tc-hub-item-placeholder {
    display: grid;
    place-items: center;
    min-height: 100px;
    background: linear-gradient(135deg, #F0F8FC, #FAFCFE);
    color: #1E92D2;
  }

  .tc-hub-item-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    padding: 18px;
  }

  .tc-hub-item-badges {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
  }

  .tc-hub-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 8px;
    border-radius: 7px;
    font-size: 9px;
    font-weight: 800;
  }

  .tc-hub-status.published {
    background: #ECFDF3;
    color: #15803D;
  }

  .tc-hub-status.draft {
    background: #FFF7E4;
    color: #B77900;
  }

  .tc-hub-item-title {
    margin: 13px 0 7px;
    color: #00273D;
    font-size: 15px;
    font-weight: 900;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .tc-hub-item-summary {
    color: #64748B;
    font-size: 11px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .tc-hub-item-body {
    margin-top: 12px;
    color: #475569;
    font-size: 11px;
    line-height: 1.8;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .tc-hub-item-meta {
    display: flex;
    flex-direction: column;
    gap: 9px;
    margin-top: 15px;
    padding-top: 13px;
    border-top: 1px solid #EEF2F6;
  }

  .tc-hub-item-meta-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    color: #64748B;
    font-size: 10px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .tc-hub-item-meta-row svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: #1E92D2;
  }

  .tc-hub-item-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: auto;
    padding-top: 16px;
  }

  .tc-hub-action-button {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 10px;
    border: 1px solid #DCE7EF;
    border-radius: 9px;
    background: #FFFFFF;
    color: #00466D;
    font-size: 10px;
    font-weight: 800;
    transition: background .18s ease, border-color .18s ease;
  }

  .tc-hub-action-button:hover {
    border-color: #BDD7E5;
    background: #F4FAFD;
  }

  .tc-hub-action-button.primary {
    border-color: #00466D;
    background: #00466D;
    color: #FFFFFF;
  }

  .tc-hub-action-button.primary:hover {
    border-color: #00273D;
    background: #00273D;
  }

  .tc-hub-action-button.danger {
    border-color: #FECACA;
    color: #B91C1C;
  }

  .tc-hub-action-button.danger:hover {
    background: #FFF7F7;
  }

  .tc-hub-action-button:disabled,
  .tc-hub .tc-button:disabled {
    cursor: not-allowed;
    opacity: .55;
    transform: none;
  }

  .tc-hub-empty {
    grid-column: 1 / -1;
    padding: 35px 22px;
    border: 1px dashed #C8DCE7;
    border-radius: 14px;
    background: #FFFFFF;
    text-align: center;
  }

  .tc-hub-empty-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    margin: 0 auto 13px;
    border-radius: 13px;
    background: #EAF5FB;
    color: #00466D;
  }

  .tc-hub-empty-title {
    color: #00273D;
    font-size: 13px;
    font-weight: 900;
  }

  .tc-hub-empty-copy {
    max-width: 390px;
    margin: 7px auto 0;
    color: #64748B;
    font-size: 11px;
    line-height: 1.8;
  }

  .tc-hub-loading {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 17px;
  }

  .tc-hub-skeleton {
    height: 220px;
    border: 1px solid #DCE7EF;
    border-radius: 14px;
    background: linear-gradient(
      100deg,
      #FFFFFF 20%,
      #F1F6F9 40%,
      #FFFFFF 60%
    );
    background-size: 200% 100%;
    animation: tc-hub-shimmer 1.5s ease infinite;
  }

  @keyframes tc-hub-shimmer {
    from { background-position: 100% 0; }
    to { background-position: -100% 0; }
  }

  @media (max-width: 1050px) {
    .tc-hub-content-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 700px) {
    .tc-hub-stats {
      gap: 9px;
    }

    .tc-hub-stat {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
      padding: 12px;
    }

    .tc-hub-stat-icon {
      width: 35px;
      height: 35px;
    }

    .tc-hub-stat-value {
      font-size: 22px;
    }

    .tc-hub-panel {
      padding: 16px;
    }

    .tc-hub-form-grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 14px;
    }

    .tc-hub-field.full {
      grid-column: auto;
    }

    .tc-hub-panel-heading {
      gap: 10px;
    }

    .tc-hub-form-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .tc-hub-form-actions-left,
    .tc-hub-form-actions-right {
      width: 100%;
    }

    .tc-hub-form-actions .tc-button {
      flex: 1;
    }

    .tc-hub-list-heading {
      align-items: flex-start;
    }

    .tc-hub-filter-row {
      align-items: flex-start;
      flex-direction: column;
    }

    .tc-hub-filter-tabs {
      width: 100%;
    }

    .tc-hub-filter {
      flex: 1;
      padding: 0 7px;
    }

    .tc-hub-loading {
      grid-template-columns: minmax(0, 1fr);
    }

    .tc-hub-item-content {
      padding: 15px;
    }

    .tc-hub-item-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .tc-hub-action-button {
      padding: 0 7px;
    }
  }

  @media (max-width: 390px) {
    .tc-hub-stats {
      grid-template-columns: minmax(0, 1fr);
    }

    .tc-hub-stat {
      align-items: center;
      flex-direction: row;
    }

    .tc-hub-form-actions-left,
    .tc-hub-form-actions-right {
      align-items: stretch;
      flex-direction: column;
    }
  }
`;

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value: string | null): string {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTypeLabel(contentType: HubType): string {
  return (
    types.find((type) => type.value === contentType)?.label ??
    contentType
  );
}

/* =========================================================
   COMPANY HUB
========================================================= */

export default function CompanyHub() {
  const [items, setItems] = useState<HubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [media, setMedia] = useState<File | null>(null);
  const [filter, setFilter] = useState<'ALL' | HubStatus>('ALL');
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const selectedType = useMemo(
    () => types.find((type) => type.value === form.contentType),
    [form.contentType],
  );

  const publishedCount = useMemo(
    () => items.filter((item) => item.status === 'PUBLISHED').length,
    [items],
  );

  const draftCount = useMemo(
    () => items.filter((item) => item.status === 'DRAFT').length,
    [items],
  );

  const visibleItems = useMemo(() => {
    if (filter === 'ALL') return items;

    return items.filter((item) => item.status === filter);
  }, [items, filter]);

  /* ---------------------------------------------------------
     LOAD CONTENT
     Existing endpoint and response contract are unchanged.
  --------------------------------------------------------- */

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get<HubItem[]>('/api/company/hub');

      setItems(
        Array.isArray(response.data)
          ? response.data
          : [],
      );
    } catch (requestError) {
      console.error(requestError);

      setError(
        'Could not load Company Hub content. Check that the backend migration has been applied and you are signed in as an employer.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* ---------------------------------------------------------
     FORM HELPERS
  --------------------------------------------------------- */

  const reset = () => {
    setEditingId(null);
    setForm(blank);
    setMedia(null);

    const fileInput = document.getElementById(
      'tc-hub-media-input',
    ) as HTMLInputElement | null;

    if (fileInput) fileInput.value = '';
  };

  const edit = (item: HubItem) => {
    setEditingId(item.id);
    setNotice('');
    setError('');

    setForm({
      title: item.title,
      summary: item.summary ?? '',
      body: item.body ?? '',
      contentType: item.contentType,
      category: item.category ?? '',
      eventStartsAt: item.eventStartsAt?.slice(0, 16) ?? '',
      eventEndsAt: item.eventEndsAt?.slice(0, 16) ?? '',
      eventLocation: item.eventLocation ?? '',
    });

    setMedia(null);

    const fileInput = document.getElementById(
      'tc-hub-media-input',
    ) as HTMLInputElement | null;

    if (fileInput) fileInput.value = '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* ---------------------------------------------------------
     CREATE OR UPDATE CONTENT
     Existing payload and endpoints are unchanged.
  --------------------------------------------------------- */

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const payload = {
        ...form,
        eventStartsAt: form.eventStartsAt || null,
        eventEndsAt: form.eventEndsAt || null,
      };

      const response = editingId
        ? await api.put<HubItem>(
            `/api/company/hub/${editingId}`,
            payload,
          )
        : await api.post<HubItem>(
            '/api/company/hub',
            payload,
          );

      let saved = response.data;

      if (media && saved?.id) {
        const data = new FormData();

        data.append('file', media);

        const uploaded = await api.post<HubItem>(
          `/api/company/hub/${saved.id}/media`,
          data,
        );

        saved = uploaded.data;
      }

      setNotice(
        media
          ? 'Content saved and media uploaded successfully.'
          : editingId
            ? 'Your content changes have been saved.'
            : 'Content saved as a draft.',
      );

      reset();

      await load();
    } catch (requestError) {
      console.error(requestError);

      setError(
        'Unable to save content. Check the title, event dates, media format, and backend response.',
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------
     PUBLISH OR UNPUBLISH
     Existing endpoint is unchanged.
  --------------------------------------------------------- */

  const publish = async (
    item: HubItem,
    value: boolean,
  ) => {
    setBusyItemId(item.id);
    setError('');
    setNotice('');

    try {
      await api.post(
        `/api/company/hub/${item.id}/publish?publish=${value}`,
      );

      setNotice(
        value
          ? 'Content published to candidates.'
          : 'Content returned to drafts.',
      );

      await load();
    } catch (requestError) {
      console.error(requestError);
      setError('Could not change publication status.');
    } finally {
      setBusyItemId(null);
    }
  };

  /* ---------------------------------------------------------
     DELETE CONTENT
     Existing endpoint and confirmation are preserved.
  --------------------------------------------------------- */

  const remove = async (item: HubItem) => {
    if (
      !window.confirm(
        `Delete “${item.title}”? This cannot be undone.`,
      )
    ) {
      return;
    }

    setBusyItemId(item.id);
    setError('');
    setNotice('');

    try {
      await api.delete(`/api/company/hub/${item.id}`);

      setItems((current) =>
        current.filter((entry) => entry.id !== item.id),
      );

      if (editingId === item.id) {
        reset();
      }

      setNotice('Content deleted successfully.');
    } catch (requestError) {
      console.error(requestError);
      setError('Could not delete this content.');
    } finally {
      setBusyItemId(null);
    }
  };

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div className="tc-hub">
      <style>{HUB_STYLES}</style>

      {/* PAGE HEADING */}

      <div className="tc-page-heading">
        <div>
          <div className="tc-eyebrow">
            <ImagePlus size={13} />
            COMPANY CONTENT & ENGAGEMENT
          </div>

          <h1 className="tc-page-title">
            Company Hub
          </h1>

          <p className="tc-page-description">
            Share your company story, announcements, events,
            training and videos with professionals on TruCity.
            Prepare your content as a draft, then publish it
            when it is ready for candidates.
          </p>
        </div>

        <div className="tc-heading-actions">
          <button
            type="button"
            className="tc-button tc-button-secondary"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw size={14} />
            {loading ? 'Refreshing…' : 'Refresh content'}
          </button>

          <button
            type="button"
            className="tc-button tc-button-primary"
            onClick={() => {
              reset();
              setError('');
              setNotice('');
              document.getElementById('tc-hub-editor')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}
          >
            <Plus size={16} />
            Create content
          </button>
        </div>
      </div>

      {/* FEEDBACK */}

      {error && (
        <div
          className="tc-hub-message error"
          role="alert"
        >
          <X size={16} />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div
          className="tc-hub-message"
          role="status"
        >
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* CONTENT METRICS */}

      <div className="tc-hub-stats">
        <article className="tc-hub-stat">
          <div className="tc-hub-stat-icon">
            <FileText size={19} />
          </div>

          <div>
            <div className="tc-hub-stat-label">
              Total content
            </div>

            <div className="tc-hub-stat-value">
              {items.length.toLocaleString()}
            </div>
          </div>
        </article>

        <article className="tc-hub-stat">
          <div className="tc-hub-stat-icon published">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <div className="tc-hub-stat-label">
              Published
            </div>

            <div className="tc-hub-stat-value">
              {publishedCount.toLocaleString()}
            </div>
          </div>
        </article>

        <article className="tc-hub-stat">
          <div className="tc-hub-stat-icon draft">
            <Clock3 size={19} />
          </div>

          <div>
            <div className="tc-hub-stat-label">
              Drafts
            </div>

            <div className="tc-hub-stat-value">
              {draftCount.toLocaleString()}
            </div>
          </div>
        </article>
      </div>

      {/* CONTENT EDITOR */}

      <section
        className="tc-hub-panel"
        id="tc-hub-editor"
      >
        <div className="tc-hub-panel-heading">
          <div className="tc-hub-panel-heading-main">
            <div className="tc-hub-panel-icon">
              {editingId
                ? <Pencil size={18} />
                : <Plus size={19} />}
            </div>

            <div>
              <h2 className="tc-hub-panel-title">
                {editingId
                  ? 'Edit company content'
                  : 'Create company content'}
              </h2>

              <p className="tc-hub-panel-description">
                {editingId
                  ? 'Update the details below and save your changes.'
                  : 'Create an update for your company profile. New content is saved as a draft until you publish it.'}
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              className="tc-button tc-button-secondary"
              onClick={reset}
            >
              <X size={14} />
              Cancel
            </button>
          )}
        </div>

        <form
          onSubmit={submit}
          className="tc-hub-form-grid"
        >
          {/* TYPE */}

          <label className="tc-hub-field">
            Content type

            <select
              className="tc-hub-select"
              value={form.contentType}
              onChange={(event) =>
                setForm({
                  ...form,
                  contentType: event.target.value as HubType,
                })
              }
            >
              {types.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ))}
            </select>

            {selectedType && (
              <span className="tc-hub-type-preview">
                <CheckCircle2 size={14} />
                {selectedType.description}
              </span>
            )}
          </label>

          {/* CATEGORY */}

          <label className="tc-hub-field">
            Category

            <input
              className="tc-hub-input"
              value={form.category}
              maxLength={80}
              placeholder="e.g. Careers, Culture, Skills"
              onChange={(event) =>
                setForm({
                  ...form,
                  category: event.target.value,
                })
              }
            />

            <span className="tc-hub-field-hint">
              Add a category to help identify this update.
            </span>
          </label>

          {/* TITLE */}

          <label className="tc-hub-field full">
            Content title *

            <input
              required
              className="tc-hub-input"
              value={form.title}
              maxLength={180}
              placeholder="Give your update a clear, descriptive title"
              onChange={(event) =>
                setForm({
                  ...form,
                  title: event.target.value,
                })
              }
            />
          </label>

          {/* SUMMARY */}

          <label className="tc-hub-field full">
            Short summary

            <textarea
              className="tc-hub-textarea"
              value={form.summary}
              maxLength={500}
              rows={3}
              placeholder="Introduce the update in a few sentences."
              onChange={(event) =>
                setForm({
                  ...form,
                  summary: event.target.value,
                })
              }
            />

            <span className="tc-hub-field-hint">
              {form.summary.length}/500 characters
            </span>
          </label>

          {/* BODY */}

          <label className="tc-hub-field full">
            Full content

            <textarea
              className="tc-hub-textarea"
              value={form.body}
              rows={5}
              placeholder="Share the full details, information or announcement."
              onChange={(event) =>
                setForm({
                  ...form,
                  body: event.target.value,
                })
              }
            />
          </label>

          {/* EVENT FIELDS */}

          {[
            'SEMINAR',
            'WEBINAR',
            'TRAINING',
          ].includes(form.contentType) && (
            <>
              <label className="tc-hub-field">
                Starts at

                <input
                  type="datetime-local"
                  className="tc-hub-input"
                  value={form.eventStartsAt}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      eventStartsAt: event.target.value,
                    })
                  }
                />
              </label>

              <label className="tc-hub-field">
                Ends at

                <input
                  type="datetime-local"
                  className="tc-hub-input"
                  value={form.eventEndsAt}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      eventEndsAt: event.target.value,
                    })
                  }
                />
              </label>

              <label className="tc-hub-field full">
                Location or joining details

                <input
                  className="tc-hub-input"
                  value={form.eventLocation}
                  maxLength={250}
                  placeholder="Venue, online, or meeting details"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      eventLocation: event.target.value,
                    })
                  }
                />
              </label>
            </>
          )}

          {/* MEDIA UPLOAD */}

          <div className="tc-hub-field full">
            Attach image or video

            <div className="tc-hub-upload">
              <div className="tc-hub-upload-top">
                <div className="tc-hub-upload-icon">
                  <ImagePlus size={18} />
                </div>

                <div>
                  <div className="tc-hub-upload-title">
                    Add visual content
                  </div>

                  <div className="tc-hub-upload-copy">
                    Attach an image or video to make your
                    company update more engaging.
                  </div>
                </div>
              </div>

              <input
                id="tc-hub-media-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                className="tc-hub-file-input"
                onChange={(event) =>
                  setMedia(
                    event.target.files?.[0] ?? null,
                  )
                }
              />

              <span className="tc-hub-field-hint">
                Supported formats: JPG, PNG, WEBP, MP4,
                WEBM and MOV. Maximum file size: 50 MB.
              </span>

              {media && (
                <div className="tc-hub-selected-file">
                  {media.type.startsWith('video/')
                    ? <Video size={15} />
                    : <ImagePlus size={15} />}

                  <span>
                    Selected: {media.name}
                  </span>

                  <button
                    type="button"
                    className="tc-hub-action-button"
                    onClick={() => {
                      setMedia(null);

                      const fileInput = document.getElementById(
                        'tc-hub-media-input',
                      ) as HTMLInputElement | null;

                      if (fileInput) fileInput.value = '';
                    }}
                    aria-label="Remove selected media"
                    title="Remove selected media"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* FORM ACTIONS */}

          <div className="tc-hub-field full">
            <div className="tc-hub-form-actions">
              <div className="tc-hub-form-actions-left">
                <button
                  type="submit"
                  className="tc-button tc-button-primary"
                  disabled={saving}
                >
                  {saving
                    ? <RefreshCw size={15} />
                    : editingId
                      ? <CheckCircle2 size={15} />
                      : <Plus size={16} />}

                  {saving
                    ? 'Saving…'
                    : editingId
                      ? 'Save changes'
                      : 'Save draft'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="tc-button tc-button-secondary"
                    disabled={saving}
                    onClick={reset}
                  >
                    <X size={14} />
                    Cancel edit
                  </button>
                )}
              </div>

              <div className="tc-hub-form-actions-right">
                <span className="tc-hub-field-hint">
                  Publishing is managed from your content list.
                </span>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* CONTENT LIST */}

      <section>
        <div className="tc-hub-list-heading">
          <div>
            <h2>Your company content</h2>

            <p>
              Manage your company stories, announcements,
              events, training and videos.
            </p>
          </div>

          <button
            type="button"
            className="tc-button tc-button-secondary"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="tc-hub-filter-row">
          <div
            className="tc-hub-filter-tabs"
            role="group"
            aria-label="Filter company content"
          >
            <button
              type="button"
              className={`tc-hub-filter ${
                filter === 'ALL' ? 'active' : ''
              }`}
              aria-pressed={filter === 'ALL'}
              onClick={() => setFilter('ALL')}
            >
              All ({items.length})
            </button>

            <button
              type="button"
              className={`tc-hub-filter ${
                filter === 'PUBLISHED' ? 'active' : ''
              }`}
              aria-pressed={filter === 'PUBLISHED'}
              onClick={() => setFilter('PUBLISHED')}
            >
              Published ({publishedCount})
            </button>

            <button
              type="button"
              className={`tc-hub-filter ${
                filter === 'DRAFT' ? 'active' : ''
              }`}
              aria-pressed={filter === 'DRAFT'}
              onClick={() => setFilter('DRAFT')}
            >
              Drafts ({draftCount})
            </button>
          </div>

          <span className="tc-live-label">
            <span className="tc-live-dot" />
            {publishedCount} visible to candidates
          </span>
        </div>

        {loading ? (
          <div className="tc-hub-loading">
            {[0, 1].map((index) => (
              <div
                className="tc-hub-skeleton"
                key={index}
              />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="tc-hub-empty">
            <div className="tc-hub-empty-icon">
              {filter === 'PUBLISHED'
                ? <CheckCircle2 size={21} />
                : filter === 'DRAFT'
                  ? <Clock3 size={21} />
                  : <FileText size={21} />}
            </div>

            <div className="tc-hub-empty-title">
              {filter === 'PUBLISHED'
                ? 'No published content yet'
                : filter === 'DRAFT'
                  ? 'No drafts to display'
                  : 'Your Company Hub is ready'}
            </div>

            <p className="tc-hub-empty-copy">
              {filter === 'PUBLISHED'
                ? 'When you publish company content, it will appear here and become visible to candidates.'
                : filter === 'DRAFT'
                  ? 'Content you save as a draft will appear here until you publish or delete it.'
                  : 'Create your first company story, announcement, event or video using the editor above.'}
            </p>

            {filter !== 'ALL' && (
              <button
                type="button"
                className="tc-button tc-button-secondary"
                style={{ marginTop: 16 }}
                onClick={() => setFilter('ALL')}
              >
                View all content
              </button>
            )}
          </div>
        ) : (
          <div className="tc-hub-content-grid">
            {visibleItems.map((item) => {
              const itemBusy = busyItemId === item.id;
              const isVideo =
                item.mediaContentType?.startsWith('video/') ??
                false;

              return (
                <article
                  key={item.id}
                  className="tc-hub-item"
                >
                  {/* MEDIA */}

                  {item.mediaUrl ? (
                    isVideo ? (
                      <video
                        controls
                        preload="metadata"
                        className="tc-hub-item-video"
                        src={item.mediaUrl}
                      />
                    ) : (
                      <img
                        className="tc-hub-item-media"
                        src={item.mediaUrl}
                        alt={item.title}
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div
                      className="tc-hub-item-placeholder"
                      aria-hidden="true"
                    >
                      {item.contentType === 'VIDEO'
                        ? <Video size={27} />
                        : <FileText size={27} />}
                    </div>
                  )}

                  <div className="tc-hub-item-content">
                    {/* TYPE AND STATUS */}

                    <div className="tc-hub-item-badges">
                      <span className="tc-guidance-category">
                        {getTypeLabel(item.contentType)}
                      </span>

                      {item.category && (
                        <span className="tc-guidance-category">
                          {item.category}
                        </span>
                      )}

                      <span
                        className={`tc-hub-status ${
                          item.status === 'PUBLISHED'
                            ? 'published'
                            : 'draft'
                        }`}
                      >
                        {item.status === 'PUBLISHED'
                          ? <CheckCircle2 size={12} />
                          : <Clock3 size={12} />}

                        {item.status === 'PUBLISHED'
                          ? 'Published'
                          : 'Draft'}
                      </span>
                    </div>

                    {/* CONTENT */}

                    <h3 className="tc-hub-item-title">
                      {item.title}
                    </h3>

                    {item.summary && (
                      <div className="tc-hub-item-summary">
                        {item.summary}
                      </div>
                    )}

                    {item.body && (
                      <div className="tc-hub-item-body">
                        {item.body}
                      </div>
                    )}

                    {/* EVENT AND PUBLISH DETAILS */}

                    {(item.eventStartsAt ||
                      item.eventEndsAt ||
                      item.eventLocation ||
                      item.publishedAt) && (
                      <div className="tc-hub-item-meta">
                        {item.eventStartsAt && (
                          <div className="tc-hub-item-meta-row">
                            <CalendarDays size={14} />

                            <span>
                              Starts: {formatDate(item.eventStartsAt)}
                            </span>
                          </div>
                        )}

                        {item.eventEndsAt && (
                          <div className="tc-hub-item-meta-row">
                            <Clock3 size={14} />

                            <span>
                              Ends: {formatDate(item.eventEndsAt)}
                            </span>
                          </div>
                        )}

                        {item.eventLocation && (
                          <div className="tc-hub-item-meta-row">
                            <CalendarDays size={14} />

                            <span>{item.eventLocation}</span>
                          </div>
                        )}

                        {item.publishedAt && (
                          <div className="tc-hub-item-meta-row">
                            <CheckCircle2 size={14} />

                            <span>
                              Published {formatDate(item.publishedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="tc-hub-item-actions">
                      <button
                        type="button"
                        className="tc-hub-action-button"
                        disabled={itemBusy}
                        onClick={() => edit(item)}
                      >
                        <Pencil size={13} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="tc-hub-action-button primary"
                        disabled={itemBusy}
                        onClick={() =>
                          void publish(
                            item,
                            item.status !== 'PUBLISHED',
                          )
                        }
                      >
                        {itemBusy
                          ? <RefreshCw size={13} />
                          : <Send size={13} />}

                        {item.status === 'PUBLISHED'
                          ? 'Unpublish'
                          : 'Publish'}
                      </button>

                      <button
                        type="button"
                        className="tc-hub-action-button danger"
                        disabled={itemBusy}
                        onClick={() => void remove(item)}
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
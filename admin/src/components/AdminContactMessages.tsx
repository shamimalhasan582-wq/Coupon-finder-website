import { useEffect, useState } from 'react';
import {
  Mail,
  Trash2,
  CheckCheck,
  Eye,
  RefreshCw,
  Search,
  Filter,
  MessageSquare,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  MailOpen,
} from 'lucide-react';
import { contactMessageService, ContactMessage } from '../services/firestoreService';

const STATUS_COLORS: Record<ContactMessage['status'], string> = {
  unread: 'bg-rose-100 text-rose-700 border-rose-200',
  read: 'bg-blue-100 text-blue-700 border-blue-200',
  replied: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const SUBJECT_LABELS: Record<string, string> = {
  general: 'General Inquiry',
  partnership: 'Partnership',
  coupon: 'Coupon Issue',
  account: 'Account Support',
  other: 'Other',
  '': 'No Subject',
};

function formatDate(val: any): string {
  if (!val) return '—';
  if (val.toDate) return val.toDate().toLocaleString();
  if (val instanceof Date) return val.toLocaleString();
  return String(val);
}

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ContactMessage['status']>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = contactMessageService.listenToMessages(
      (msgs) => {
        const sorted = [...msgs].sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() ?? new Date(a.createdAt ?? 0);
          const bTime = b.createdAt?.toDate?.() ?? new Date(b.createdAt ?? 0);
          return bTime.getTime() - aTime.getTime();
        });
        setMessages(sorted);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub?.();
  }, []);

  const filtered = messages.filter((m) => {
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  const handleStatusChange = async (id: string, status: ContactMessage['status']) => {
    setUpdatingId(id);
    try {
      await contactMessageService.updateMessage(id, { status });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message permanently?')) return;
    setDeletingId(id);
    try {
      await contactMessageService.deleteMessage(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExpand = async (msg: ContactMessage) => {
    if (expandedId === msg.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(msg.id);
    if (msg.status === 'unread') {
      await contactMessageService.updateMessage(msg.id, { status: 'read' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Messages</p>
            <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
            <Mail className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Unread</p>
            <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Replied</p>
            <p className="text-2xl font-bold text-gray-900">
              {messages.filter((m) => m.status === 'replied').length}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, subject, or message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-gray-50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 bg-gray-50"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading messages…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <MailOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">No messages found</p>
          <p className="text-gray-400 text-sm mt-1">
            {messages.length === 0
              ? 'No contact messages have been received yet.'
              : 'Try adjusting your search or filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const isUpdating = updatingId === msg.id;
            const isDeleting = deletingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`bg-white rounded-xl border shadow-sm transition-all ${
                  msg.status === 'unread'
                    ? 'border-rose-200 ring-1 ring-rose-100'
                    : 'border-gray-200'
                }`}
              >
                {/* Header Row */}
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer select-none"
                  onClick={() => handleExpand(msg)}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">{msg.name}</span>
                        {msg.status === 'unread' && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[msg.status]}`}
                        >
                          {msg.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">{formatDate(msg.createdAt)}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-1" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        <a
                          href={`mailto:${msg.email}`}
                          className="hover:text-blue-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {msg.email}
                        </a>
                      </div>
                      {msg.subject && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Tag className="w-3 h-3" />
                          <span>{SUBJECT_LABELS[msg.subject] ?? msg.subject}</span>
                        </div>
                      )}
                    </div>

                    {!isExpanded && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{msg.message}</p>
                    )}
                  </div>
                </div>

                {/* Expanded Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 font-medium mr-1">Mark as:</span>

                      <button
                        disabled={isUpdating || msg.status === 'read'}
                        onClick={() => handleStatusChange(msg.id, 'read')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Read
                      </button>

                      <button
                        disabled={isUpdating || msg.status === 'replied'}
                        onClick={() => handleStatusChange(msg.id, 'replied')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Replied
                      </button>

                      <button
                        disabled={isUpdating || msg.status === 'unread'}
                        onClick={() => handleStatusChange(msg.id, 'unread')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Unread
                      </button>

                      <div className="flex-1" />

                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(SUBJECT_LABELS[msg.subject] ?? msg.subject)}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Reply via Email
                      </a>

                      <button
                        disabled={isDeleting}
                        onClick={() => handleDelete(msg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {isDeleting ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

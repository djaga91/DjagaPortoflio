/**
 * MessagesView - Système de messagerie interne.
 *
 * Affiche la liste des conversations et le chat détaillé.
 */

import { useEffect, useState, useRef } from "react";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  User,
  Briefcase,
  Users,
  ChevronLeft,
} from "lucide-react";
import { api } from "../services/api";
import { useGameStore } from "../store/gameStore";

interface Participant {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null; // DEPRECATED
  email: string;
  avatar_url: string | null;
}

// Helper pour obtenir le nom complet depuis first_name et last_name
function getParticipantName(p: Participant): string {
  if (p.first_name && p.last_name) {
    return `${p.first_name} ${p.last_name}`;
  }
  if (p.first_name) {
    return p.first_name;
  }
  if (p.last_name) {
    return p.last_name;
  }
  return p.full_name || p.email.split("@")[0];
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_name: string | null;
  sender_avatar: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  is_deleted: boolean;
}

interface ConversationItem {
  id: string;
  subject: string | null;
  context: string;
  participants: Participant[];
  last_message: Message | null;
  unread_count: number;
  updated_at: string;
}

interface ConversationDetail {
  conversation: ConversationItem;
  messages: Message[];
  total_messages: number;
}

const CONTEXT_LABELS: Record<string, string> = {
  job_application: "Candidature",
  job_inquiry: "Question offre",
  partnership: "Partenariat",
  general: "Général",
  support: "Support",
};

const CONTEXT_ICONS: Record<string, React.ReactNode> = {
  job_application: <Briefcase className="w-4 h-4" />,
  job_inquiry: <Briefcase className="w-4 h-4" />,
  partnership: <Users className="w-4 h-4" />,
  general: <MessageSquare className="w-4 h-4" />,
  support: <User className="w-4 h-4" />,
};

export default function MessagesView() {
  const { setView, user } = useGameStore();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadTotal, setUnreadTotal] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/messages/conversations", {
        params: { per_page: 50 },
      });
      setConversations(res.data.items);
      setUnreadTotal(res.data.unread_total);
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetail = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(
        `/api/messages/conversations/${conversationId}`,
      );
      setSelectedConversation(res.data);

      // Marquer comme lu
      await api.put(`/api/messages/conversations/${conversationId}/read`);

      // Mettre à jour le compteur local
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c,
        ),
      );
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const res = await api.post(
        `/api/messages/conversations/${selectedConversation.conversation.id}/messages`,
        { content: newMessage.trim() },
      );

      // Ajouter le message localement
      setSelectedConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, res.data],
        };
      });

      // Mettre à jour la conversation dans la liste
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.conversation.id
            ? {
                ...c,
                last_message: res.data,
                updated_at: new Date().toISOString(),
              }
            : c,
        ),
      );

      setNewMessage("");
    } catch (err) {
      console.error("Erreur envoi message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  const getOtherParticipants = (participants: Participant[]) => {
    return participants.filter((p) => p.user_id !== user?.id);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1)
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (days < 1) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const others = getOtherParticipants(c.participants);
    return (
      others.some(
        (p) =>
          getParticipantName(p).toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query),
      ) ||
      c.subject?.toLowerCase().includes(query) ||
      c.last_message?.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="py-4 h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setView("dashboard")}
          className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-theme-text-secondary" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-blue-500" />
            Messages
          </h1>
          {unreadTotal > 0 && (
            <p className="text-theme-text-secondary">
              {unreadTotal} message{unreadTotal > 1 ? "s" : ""} non lu
              {unreadTotal > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex bg-theme-card border border-theme-card-border rounded-xl overflow-hidden h-[calc(100%-80px)]">
        {/* Liste des conversations */}
        <div
          className={`w-full md:w-80 border-r border-theme-border flex flex-col ${
            selectedConversation ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Recherche */}
          <div className="p-4 border-b border-theme-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-text-muted" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-theme-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-theme-text-muted">Aucune conversation</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const others = getOtherParticipants(conv.participants);
                const isSelected =
                  selectedConversation?.conversation.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => fetchConversationDetail(conv.id)}
                    className={`w-full p-4 text-left border-b border-theme-border hover:bg-theme-bg-tertiary transition ${
                      isSelected ? "bg-blue-500/10" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {others[0]?.full_name?.[0]?.toUpperCase() ||
                          others[0]?.email[0]?.toUpperCase() ||
                          "?"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-medium truncate ${conv.unread_count > 0 ? "text-theme-text-primary" : "text-theme-text-secondary"}`}
                          >
                            {others
                              .map((p) => getParticipantName(p))
                              .join(", ")}
                          </span>
                          {conv.last_message && (
                            <span className="text-xs text-theme-text-muted flex-shrink-0">
                              {formatTime(conv.last_message.created_at)}
                            </span>
                          )}
                        </div>

                        {conv.subject && (
                          <p className="text-sm text-theme-text-muted truncate">
                            {conv.subject}
                          </p>
                        )}

                        {conv.last_message && (
                          <p
                            className={`text-sm truncate ${conv.unread_count > 0 ? "text-theme-text-primary font-medium" : "text-theme-text-muted"}`}
                          >
                            {conv.last_message.sender_id === user?.id &&
                              "Vous: "}
                            {conv.last_message.content}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-theme-bg-tertiary text-theme-text-muted flex items-center gap-1">
                            {CONTEXT_ICONS[conv.context]}
                            {CONTEXT_LABELS[conv.context] || conv.context}
                          </span>
                          {conv.unread_count > 0 && (
                            <span className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white text-xs font-bold rounded-full">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div
          className={`flex-1 flex flex-col ${
            selectedConversation ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Header du chat */}
              <div className="p-4 border-b border-theme-border flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-theme-bg-tertiary rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-theme-text-secondary" />
                </button>

                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {getParticipantName(
                    getOtherParticipants(
                      selectedConversation.conversation.participants,
                    )[0] || ({} as Participant),
                  )[0]?.toUpperCase() || "?"}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-theme-text-primary">
                    {getOtherParticipants(
                      selectedConversation.conversation.participants,
                    )
                      .map((p) => getParticipantName(p))
                      .join(", ")}
                  </p>
                  {selectedConversation.conversation.subject && (
                    <p className="text-sm text-theme-text-muted">
                      {selectedConversation.conversation.subject}
                    </p>
                  )}
                </div>

                <button className="p-2 hover:bg-theme-bg-tertiary rounded-lg">
                  <MoreVertical className="w-5 h-5 text-theme-text-secondary" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
                  </div>
                ) : selectedConversation.messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-theme-text-muted mx-auto mb-3 opacity-30" />
                    <p className="text-theme-text-muted">
                      Commencez la conversation !
                    </p>
                  </div>
                ) : (
                  selectedConversation.messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isMe
                              ? "bg-blue-500 text-white rounded-br-md"
                              : "bg-theme-bg-tertiary text-theme-text-primary rounded-bl-md"
                          }`}
                        >
                          {!isMe && msg.sender_name && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {msg.sender_name}
                            </p>
                          )}
                          <p
                            className={
                              msg.is_deleted ? "italic opacity-50" : ""
                            }
                          >
                            {msg.content}
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 ${isMe ? "text-blue-100" : "text-theme-text-muted"}`}
                          >
                            <span className="text-xs">
                              {new Date(msg.created_at).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            {isMe &&
                              (msg.is_read ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-theme-border">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-primary placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-theme-text-muted mx-auto mb-4 opacity-20" />
                <p className="text-theme-text-muted">
                  Sélectionnez une conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

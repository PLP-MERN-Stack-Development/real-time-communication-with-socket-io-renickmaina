// Sidebar.jsx
import { useMemo, useState } from "react";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogCloseButton
} from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";

const ordinals = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "numeric"
});

function formatTimestamp(dateLike) {
  if (!dateLike) return "";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return ordinals.format(date);

  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffInDays < 7) return date.toLocaleDateString(undefined, { weekday: "short" });

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function lastMessagePreview(message) {
  if (!message || !message.text) return "No messages yet";
  return message.text.length > 48 ? `${message.text.slice(0, 48)}…` : message.text;
}

export default function Sidebar({
  currentUserId,
  currentDisplayName,
  currentAvatar,
  conversations,
  directory,
  isBootstrapping,
  isLoadingConversations,
  onSelectConversation,
  onStartConversation,
  onRefresh,
  error,
  activeConversationId
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const term = search.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const inName = conversation.name?.toLowerCase().includes(term);
      const inMember = conversation.members?.some((member) =>
        member.displayName?.toLowerCase().includes(term)
      );
      const inLastMessage = conversation.lastMessage?.text?.toLowerCase().includes(term);
      return inName || inMember || inLastMessage;
    });
  }, [conversations, search]);

  const filteredDirectory = useMemo(() => {
    const term = search.trim().toLowerCase();
    return directory.filter((person) =>
      !term || person.displayName?.toLowerCase().includes(term) || person.email?.toLowerCase().includes(term)
    );
  }, [directory, search]);

  const handleConversationClick = (conversationId) => {
    onSelectConversation?.(conversationId);
  };

  const handleStartConversation = async (userId) => {
    await onStartConversation?.(userId);
    setIsDialogOpen(false);
  };

  return (
    <aside className="flex w-76 flex-col rounded-3xl border border-white/10 bg-sidebar-gradient/90 p-4">
      {/* USER INFO */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <Avatar src={currentAvatar} alt={currentDisplayName} fallback={currentDisplayName} />
          <div>
            <p className="text-sm font-medium text-white">{currentDisplayName}</p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <Input
          placeholder="🔍"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CONVERSATIONS HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Chats</p>
          <p className="text-[11px] text-slate-500">
            {conversations.length} active {conversations.length === 1 ? "chat" : "chats"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoadingConversations}>
          {isLoadingConversations ? "…" : "↻"}
        </Button>
      </div>

      {/* CONVERSATION LIST */}
      <ScrollArea className="flex-1 rounded-2xl border border-white/5 bg-white/[0.03] relative">
        <div className="space-y-1 py-2">
          {error && (
            <div className="mx-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {isBootstrapping && (
            <div className="space-y-2 px-3 py-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-white/5 bg-white/[0.06] px-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 rounded-full bg-white/10" />
                      <div className="h-3 w-1/2 rounded-full bg-white/5" />
                    </div>
                    <div className="h-3 w-10 rounded-full bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isBootstrapping && filteredConversations.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              Nothing here yet. Tap <span className="text-indigo-300">+</span> to start a chat.
            </div>
          )}

          {!isBootstrapping && filteredConversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            const otherMember = conversation.members?.find((m) => m.clerkUserId !== currentUserId) || conversation.members?.[0];

            return (
              <button
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
                  isActive ? "bg-indigo-500/10 ring-1 ring-indigo-400/40" : "hover:bg-white/[0.06]"
                )}
              >
                <Avatar
                  src={conversation.isGroup ? conversation.avatar : otherMember?.avatarUrl}
                  alt={conversation.name}
                  fallback={conversation.name}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{conversation.name}</p>
                  <p className="text-[11px] text-slate-400">{lastMessagePreview(conversation.lastMessage)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[11px] text-slate-500">
                    {formatTimestamp(conversation.lastMessageAt || conversation.createdAt)}
                  </span>
                  {conversation.unreadCount > 0 && <Badge variant="outline">{conversation.unreadCount}</Badge>}
                </div>
              </button>
            );
          })}
        </div>

        {/* BOTTOM + BUTTON */}
        <div className="absolute bottom-4 right-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="p-3 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors shadow-lg"
              >
                +
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a Chat</DialogTitle>
                <DialogDescription>
                  Pick a teammate to start chatting instantly.
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="mt-4 h-64">
                <div className="space-y-2 pr-2">
                  {filteredDirectory.length === 0 && (
                    <p className="text-sm text-slate-400">No matches found.</p>
                  )}
                  {filteredDirectory.map((person) => (
                    <button
                      key={person.clerkUserId}
                      onClick={() => handleStartConversation(person.clerkUserId)}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2 text-left hover:border-indigo-500/60 hover:bg-indigo-500/10"
                    >
                      <Avatar src={person.avatarUrl} alt={person.displayName} fallback={person.displayName} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{person.displayName}</p>
                        {person.email && <p className="text-[11px] text-slate-400">{person.email}</p>}
                      </div>
                      <span className="text-xs text-indigo-300">Chat →</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <DialogFooter>
                <DialogCloseButton />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ScrollArea>
    </aside>
  );
}

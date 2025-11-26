//chatWindow.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";
import { useSocket } from "../hooks/useSocket";

const longDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function ChatWindow({
  messagesApi,
  conversation,
  conversationId,
  currentUser,
  onConversationSeen,
  onMessageSent,
  isBootstrapping,
  currentUserId
}) {
  const service = useMemo(() => {
    if (messagesApi) return messagesApi;
    return {
      async list() {
        return [];
      },
      async send() {
        throw new Error("messagesApi not provided");
      }
    };
  }, [messagesApi]);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  // ===============================================================
  //     🔥 ADDED FOR TYPING INDICATOR
  // ===============================================================
  const [isTyping, setIsTyping] = useState(false);
  // ===============================================================

  const viewportRef = useRef(null);
  const conversationIdRef = useRef(conversationId);

  const socket = useSocket(currentUserId);

  // determine the other participant
  const otherMember = useMemo(() => {
    if (!conversation || !currentUser?.id) return null;
    if (conversation.isGroup) return null;
    return conversation.members?.find(
      (member) => member.clerkUserId !== currentUser.id
    ) || null;
  }, [conversation, currentUser]);

  // reset state when changing conversations
  useEffect(() => {
    setMessages([]);
    setDraft("");
    setError(null);
    setIsTyping(false); // <-- ADDED, resets typing indicator
  }, [conversationId]);

  // load conversation history
  useEffect(() => {
    if (!conversationId) return;
    let active = true;
    setIsLoading(true);
    (async () => {
      try {
        const data = await service.list(conversationId);
        if (!active) return;
        setMessages(Array.isArray(data) ? data : []);
        onConversationSeen?.(conversationId);
      } catch (err) {
        if (active) setError("We couldn't fetch the conversation history.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [service, conversationId, onConversationSeen]);

  // auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    node.scrollTo({
      top: node.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // join conversation room + socket listeners
  useEffect(() => {
    conversationIdRef.current = conversationId;
    if (!socket || !conversationId) return;

    socket.emit("conversation:join", conversationId);

    const handleNewMessage = ({ conversationId: id, message }) => {
      if (id === conversationIdRef.current) {
        setMessages((prev) => {
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });

        // 🔥 stop typing when message arrives
        setIsTyping(false);
      }
    };

    const handleConversationUpdate = ({ conversationId: id }) => {
      if (id === conversationIdRef.current) onConversationSeen?.(id);
    };

    // ===============================================================
    //        🔥 ADDED FOR TYPING INDICATOR
    // ===============================================================
    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    // ===============================================================

    socket.on("message:new", handleNewMessage);
    socket.on("conversation:update", handleConversationUpdate);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("conversation:update", handleConversationUpdate);

      // remove typing listeners
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);

      socket.emit("conversation:leave", conversationIdRef.current);
    };
  }, [socket, conversationId, onConversationSeen]);

  
  // ===============================================================
  //         🔥 TRIGGER TYPING EVENTS WHEN USER TYPES
  // ===============================================================
  const handleTypingInput = (event) => {
    const value = event.target.value;

    setDraft(value);

    if (!socket || !conversationId) return;

    // typing started
    socket.emit("typing", { conversationId });

    // stop typing when input empty
    if (value.trim() === "") {
      socket.emit("stopTyping", { conversationId });
    }
  };
  // ===============================================================


  // sending message handler
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !conversationId) return;

    setIsSending(true);
    setError(null);

    try {
      const nextMessage = await service.send(conversationId, draft.trim());

      setMessages((prev) => {
        const exists = prev.some(m => m._id === nextMessage._id);
        if (exists) return prev;
        return [...prev, nextMessage];
      });

      onMessageSent?.(conversationId, nextMessage);

      socket?.emit("message:new", {
        conversationId,
        message: nextMessage,
      });

      // 🔥 stop typing after sending
      socket.emit("stopTyping", { conversationId });
      setIsTyping(false);

      setDraft("");
    } catch (err) {
      setError("Your message could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (isBootstrapping) {
    return <section className="flex flex-1 flex-col justify-center p-8 text-slate-300">
      Preparing your conversations…
    </section>;
  }

  if (!conversationId || !conversation) {
    return <section className="flex flex-1 flex-col items-center justify-center p-10 text-center text-sm text-slate-400">
      Choose a conversation to begin chatting.
    </section>;
  }

  return (
    <section className="flex flex-1 flex-col overflow-hidden">

      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={conversation.isGroup ? conversation.avatar : otherMember?.avatarUrl}
            alt={conversation.name}
            fallback={conversation.name}
          />
          <div>
            <p className="text-sm font-semibold text-white">{conversation.name}</p>

            {/* 🔥 SIMPLE TYPING INDICATOR */}
            {isTyping ? (
              <p className="text-xs italic text-green-400">
                typing…
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                {otherMember?.lastSeenAt
                  ? `Last seen ${longDateFormatter.format(new Date(otherMember.lastSeenAt))}`
                  : conversation.isGroup
                  ? `${conversation.members?.length || 0} participants`
                  : "Online"}
              </p>
            )}
          </div>
        </div>

        <Badge variant="outline" className="hidden sm:inline-flex">
          Live Socket Chat
        </Badge>
      </header>

      <div ref={viewportRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">

        {isLoading && <div className="text-sm text-slate-300">Loading messages…</div>}

        {!isLoading && messages.length === 0 && (
          <div className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm">
            No messages yet — start the conversation.
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={message._id ? `${message._id}-${index}` : `msg-${index}`}
            message={message}
            isMine={message.senderId === currentUser.id}
            currentUser={currentUser}
            otherMember={otherMember}
          />
        ))}
      </div>

      <footer className="border-t px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">

          {/* 🔥 ADDED TYPING HANDLER */}
          <Input
            value={draft}
            onChange={handleTypingInput}
            placeholder="Write a message..."
            disabled={isSending}
          />

          <Button type="submit" disabled={!draft.trim() || isSending}>
            {isSending ? "Sending…" : "Send"}
          </Button>
        </form>

        {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      </footer>
    </section>
  );
}

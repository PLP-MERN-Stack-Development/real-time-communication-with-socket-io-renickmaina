import { Avatar } from "./ui/avatar";
import { cn } from "../lib/utils";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
hour: "numeric",
minute: "numeric"
});

export default function MessageBubble({ message, isMine, currentUser, otherMember }) {
const timestamp = message?.createdAt ? new Date(message.createdAt) : null;

return (
<div
className={cn(
"flex items-end gap-3 relative",
isMine ? "justify-end" : "justify-start"
)}
>
{!isMine && (
<Avatar
size="sm"
src={message.senderAvatar || otherMember?.avatarUrl}
alt={message.senderName}
fallback={message.senderName}
/>
)}

```
  <div className="flex max-w-xl flex-col gap-1 relative">
    <p className="text-[11px] uppercase tracking-wide text-slate-400">
      {isMine ? currentUser?.name : message.senderName}
    </p>

    <div
      className={cn(
        "relative rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg",
        isMine
          ? "bg-gradient-to-r from-indigo-500/90 to-purple-500/90 text-white shadow-indigo-900/30"
          : "bg-white/80 backdrop-blur-md text-slate-900 shadow-slate-300/20 border border-white/20"
      )}
    >
      <p className="whitespace-pre-wrap break-words">{message.text}</p>

      {/* Tail Pointer */}
      <span
        className={cn(
          "absolute w-3 h-3 bg-inherit",
          isMine
            ? "right-[-6px] bottom-0 rotate-45 origin-bottom-left"
            : "left-[-6px] bottom-0 rotate-45 origin-bottom-right"
        )}
      ></span>
    </div>

    <div className="flex items-center gap-2 text-[10px] text-slate-400/80">
      {timestamp && <span>{timeFormatter.format(timestamp)}</span>}

      {/* Read receipt icon */}
      {isMine && (
        <span>
          {message.status === "seen" ? (
            <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-indigo-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </span>
      )}
    </div>
  </div>

  {isMine && (
    <Avatar
      size="sm"
      src={currentUser?.avatar}
      alt={currentUser?.name}
      fallback={currentUser?.name}
    />
  )}
</div>


);
}

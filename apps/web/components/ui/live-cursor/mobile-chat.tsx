"use client";

import { memo, forwardRef } from "react";
import { MessageCircle, X } from "lucide-react";

interface MobileChatButtonProps {
  onClick: () => void;
}

export const MobileChatButton = memo(function MobileChatButton({
  onClick,
}: MobileChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      aria-label="Open chat"
    >
      <MessageCircle className="w-5 h-5" />
    </button>
  );
});

interface MobileChatModalProps {
  currentMessage: string;
  onMessageChange: (message: string) => void;
  onSend: () => void;
  onClose: () => void;
  hasOthersOnSamePath: boolean;
  messages: Array<{ text: string; timestamp: number }>;
  userColor: string;
}

export const MobileChatModal = memo(
  forwardRef<HTMLInputElement, MobileChatModalProps>(function MobileChatModal(
    {
      currentMessage,
      onMessageChange,
      onSend,
      onClose,
      hasOthersOnSamePath,
      messages,
      userColor,
    },
    ref
  ) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && currentMessage.trim()) {
        onSend();
      }
    };

    return (
      <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-background/95 backdrop-blur-md border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
          <input
            ref={ref}
            type="text"
            value={currentMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasOthersOnSamePath
                ? "Type a message..."
                : "No one else here yet..."
            }
            maxLength={100}
            className="flex-1 px-4 py-2 rounded-lg bg-accent/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={onSend}
            disabled={!currentMessage.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            Send
          </button>
        </div>
        {messages.length > 0 && (
          <div className="mt-3 max-w-lg mx-auto space-y-1">
            {messages.map((msg) => (
              <div
                key={msg.timestamp}
                className="text-xs text-muted-foreground px-2"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: userColor }}
                />
                {msg.text}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  })
);

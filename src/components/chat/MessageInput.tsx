import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatApi } from "@/lib/api/chat.api";

interface MessageInputProps {
  onSendMessage: (message: string, attachments?: any[]) => void;
  isLoading?: boolean;
  conversationId?: string;
}

export function MessageInput({
  onSendMessage,
  isLoading,
  conversationId,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSend = () => {
    if (!message.trim()) return;

    onSendMessage(message, attachments.length ? attachments : undefined);
    setMessage("");
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "36px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !conversationId) return;

    setUploadingFiles(true);
    try {
      const uploadedFiles = [];

      for (const file of Array.from(files)) {
        const presign = await chatApi.getPresignedUploadUrl(
          file.name,
          file.type
        );

        await fetch(presign.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        uploadedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: presign.publicPath,
        });
      }

      setAttachments((prev) => [...prev, ...uploadedFiles]);
    } finally {
      setUploadingFiles(false);
    }
  };

  // FIXED auto-resize (max 3 lines)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "36px";
    el.style.height = Math.min(el.scrollHeight, 72) + "px"; // max ~3 lines
  }, [message]);

  return (
    <div className="border-t border-border/50 bg-card p-3 space-y-2">
      {/* attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((f, i) => (
            <div
              key={i}
              className="px-2 py-1 bg-muted rounded-full text-xs flex items-center"
            >
              <span className="truncate max-w-[7rem]">{f.name}</span>
              <button
                onClick={() =>
                  setAttachments(attachments.filter((_, idx) => idx !== i))
                }
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* input bar */}
      <div className="flex items-center bg-white border border-border rounded-full px-3 py-1 gap-2 h-[44px]">
        {/* attach */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 w-8 rounded-full hover:bg-muted"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* emoji */}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full hover:bg-muted"
        >
          <Smile className="h-4 w-4" />
        </Button>

        {/* textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          placeholder="Message…"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none border-none resize-none text-sm leading-[1.3rem] h-[24px] max-h-[80px] py-[6px] "
        />

        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || uploadingFiles}
          className="h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

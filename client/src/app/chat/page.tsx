"use client";
import { useState, useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import ChatSidebar from "../components/Sidebar";
import { ArrowDown, FileText, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import SummerizationBtn from "../components/SummerizationBtn";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatSummary = {
  _id: string;
  title?: string;
  preview: string;
  createdAt: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const { token } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(Date.now());

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
      setShowScrollButton(!atBottom);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchChats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const chatId = currentChatId;

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: trimmed, chat_id: chatId }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      if (data.chat_id && !currentChatId) {
        setCurrentChatId(data.chat_id);
        fetchChats();
      }

      const assistantMsg: Message = { role: "assistant", content: data.answer };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      checkTokensAndSend(input);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (currentChatId === chatId) return;
    setLoading(true);
    setAttachedFileName(null);
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data);
      setCurrentChatId(chatId);
    } catch (err) {
      console.error("Failed to load chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    setCurrentChatId(null);
    setMessages([]);
    setAttachedFileName(null);
    inputRef.current?.focus();
  };

  const handleRemoveFile = () => {
    setAttachedFileName(null);
    setFileKey(Date.now());
  };

  const handleUploadSuccess = async (chatId: string, fileName: string) => {
    setAttachedFileName(fileName);
    await fetchChats();
    await handleSelectChat(chatId);
  };

  const checkTokensAndSend = async (text: string) => {
    if (!text.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/count-tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (data.tokens > 6000) {
        router.push("/docs/summarize");
      } else {
        await sendMessage();
      }
    } catch (err) {
      console.error("Token check failed:", err);
      sendMessage();
    }
  };

  return (
    <div className="flex w-full overflow-hidden max-h-screen">
      {/* Sidebar */}
      <div className={``}>
        <ChatSidebar
          chats={chats}
          chatMessages={messages}
          collapsed={collapsed}
          token={token}
          setCollapsed={setCollapsed}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onRefresh={fetchChats}
          currentChatId={currentChatId}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-b from-white via-zinc-100 to-white dark:from-zinc-950 dark:via-zinc-900/70 dark:to-black">
        {messages.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xl md:text-2xl font-medium text-zinc-500 dark:text-zinc-400 text-center px-4">
              What are we working on?
            </p>
          </div>
        )}

        {/* Messages */}
        <div
          ref={chatContainerRef}
          aria-live="polite"
          className="flex-1 overflow-y-auto space-y-4 px-5 md:px-10 pb-32 pt-6"
        >
          {messages.map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} className="flex w-full">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[min(85%,48rem)] px-4 py-3 rounded-2xl shadow-sm whitespace-pre-wrap break-words
                ${msg.role === "user"
                    ? "ml-auto bg-zinc-100 text-zinc-900 dark:bg-zinc-800/80 dark:text-white"
                    : "mr-auto bg-white text-zinc-900 border border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-100 dark:border-white/10"
                  }`}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2">{children}</p>,
                    strong: ({ children }) => (
                      <strong className="text-zinc-800 dark:text-zinc-300">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-zinc-600 dark:text-zinc-400">{children}</em>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-zinc-300 pl-4 italic text-zinc-700 dark:border-zinc-500 dark:text-zinc-300">
                        {children}
                      </blockquote>
                    ),
                    ul: ({ children }) => <ul className="list-disc list-inside">{children}</ul>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </motion.div>
            </div>
          ))}

          {loading && (
            <div className="mr-auto bg-white text-zinc-700 px-4 py-3 rounded-2xl border border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-200 dark:border-white/10">
              <span className="inline-flex gap-1">
                <span>Typing</span>
                <span className="animate-pulse">●</span>
                <span className="animate-pulse [animation-delay:120ms]">●</span>
                <span className="animate-pulse [animation-delay:240ms]">●</span>
              </span>
            </div>
          )}
        </div>

        {/* Scroll to bottom */}
        {showScrollButton && (
          <button
            onClick={() =>
              chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
              })
            }
            className="fixed bottom-28 right-6 z-40 rounded-full border border-zinc-300 bg-white/90 backdrop-blur p-2 text-zinc-700 shadow-sm hover:bg-white
                       dark:border-white/50 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Scroll to latest"
          >
            <ArrowDown size={18} />
          </button>
        )}

        {/* Composer */}
        <div className="sticky bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
          <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-3">
            {/* Attached File pill */}
            <AnimatePresence>
              {attachedFileName && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center w-[53%] justify-between rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-sm text-zinc-800
                             dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate" title={attachedFileName}>
                      {attachedFileName}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="ml-2 rounded-full p-0.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white"
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input row */}
            <div className="flex w-full items-center gap-2">
              <SummerizationBtn
                key={fileKey}
                setAttachedFileName={setAttachedFileName}
                onUploadSuccess={handleUploadSuccess}
                token={token}
              />
              <TextareaAutosize
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your legal query…"
                maxRows={5}
                className="flex-grow resize-none rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0
                           dark:border-zinc-700 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
              />
              <Button
                onClick={() => checkTokensAndSend(input)}
                aria-label="Send message"
                className="h-9 w-9 rounded-full bg-zinc-900 p-0 text-white transition-all duration-200 hover:bg-zinc-800
                           dark:bg-zinc-700 dark:hover:bg-zinc-800"
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <PaperPlaneIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

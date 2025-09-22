"use client";
import { useState, useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import ChatSidebar from "../components/Sidebar";
import {  FileText, X } from "lucide-react";
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
  const [promptText, setPromptText] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const { token } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(Date.now());

  const fullPrompt = "I'm Your LegalAI, Ask me anything legally...";
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let index = 0;
    inputRef.current?.focus();
    const typingInterval = setInterval(() => {
      setPromptText(fullPrompt.slice(0, index + 1));
      index++;
      if (index === fullPrompt.length) clearInterval(typingInterval);
    }, 50);
    return () => clearInterval(typingInterval);
  }, []);

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

  // Fetch chats on initial load
  useEffect(() => {
    fetchChats();
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
    setFileKey(Date.now()); // Update key to force-reset the child component
  };

  // This function is called when the file is within the token limit.
  const handleUploadSuccess = async (chatId: string, fileName: string) => {
    setAttachedFileName(fileName); // Display the file pill
    await fetchChats(); // Refresh the chat list in the sidebar
    await handleSelectChat(chatId); // Load the new chat's content
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
      sendMessage(); // fallback
    }
  };

  return (
    <div className="flex w-full overflow-hidden h-[calc(100vh-4rem)]">
      <div
        className={`transition-all duration-300 ${collapsed ? "w-14" : "w-64"}`}
      >
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
      <div className="flex-1 flex flex-col relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
        {messages.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.p
              key={promptText} // ensures it animates with changes
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-xl md:text-2xl font-mono text-zinc-400 text-center max-w-2xl px-4"
            >
              {promptText}
              <span className="typing-cursor">|</span>
            </motion.p>
          </div>
        )}

        <div
          ref={chatContainerRef}
          className=" flex-1 overflow-y-auto space-y-4 px-4 py-6"
        >
          {messages.map((msg, idx) => (
            <div
              key={`${msg.role}-${idx}-${msg.content.slice(0, 10)}`}
              className={`flex w-[75%] mx-auto ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-4 py-3 rounded-2xl whitespace-pre-wrap break-words shadow-sm ${
                  msg.role === "user"
                    ? "bg-zinc-800/70 text-white text-right w-fit"
                    : "bg-zinc-700/50 text-white text-left max-w-[85%]"
                }`}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2">{children}</p>,
                    strong: ({ children }) => (
                      <strong className="text-zinc-300">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-zinc-400">{children}</em>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-zinc-500 pl-4 italic text-zinc-300">
                        {children}
                      </blockquote>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside">{children}</ul>
                    ),
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </motion.div>
            </div>
          ))}

          {loading && (
            <div className="text-left bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white p-3 rounded-xl animate-pulse max-w-[80%]">
              Typing...
            </div>
          )}
        </div>

        {/* Typing Prompt */}
        <div className="border-t border-white/10 bg-zinc-950/70 px-4 py-3 shadow-[0_0_30px_rgba(0,0,0,0.4)] backdrop-blur-lg">
          <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-2">
            {/* Attached File Indicator (Pill) */}
            <AnimatePresence>
              {attachedFileName && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center w-[53%] justify-between rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-sm text-zinc-200"
                >
                  <div className="flex min-w-0  items-center gap-2">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate" title={attachedFileName}>
                      {attachedFileName}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="ml-2 rounded-full p-0.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                  >
                    <X size={16} />
                    <span className="sr-only">Remove file</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Input Bar */}
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
                className="flex-grow resize-none rounded-full border border-zinc-700 bg-transparent px-9 py-2 text-sm text-white placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                onClick={() => checkTokensAndSend(input)}
                aria-label="Send message"
                className="h-9 w-9 rounded-full bg-zinc-700 p-0 transition-all duration-200 hover:bg-zinc-800"
                disabled={loading || !input.trim()}
              >
                <PaperPlaneIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

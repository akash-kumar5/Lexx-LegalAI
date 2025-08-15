"use client";
import { useState, useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import ChatSidebar from "../components/Sidebar";
import { ArrowDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

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

    // const userMsg: Message = { role: "user", content: trimmed };

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const chatId = currentChatId;

      // Get assistant response
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
      console.log(data);
      if (data.chat_id && !currentChatId) {
        setCurrentChatId(data.chat_id);
        fetchChats(); // Update currentChatId on new chat
      }

      const assistantMsg: Message = { role: "assistant", content: data.answer };
      console.log("Updating Messages State:", [...messages, assistantMsg]);
      setMessages((prev) => [...prev, { ...assistantMsg }]);
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
      sendMessage();
    }
  };

  const handleSelectChat = async (chatId: string) => {
    setLoading(true);
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
    inputRef.current?.focus();
  };

  return (
    <div className="flex w-full overflow-hidden h-[calc(100vh-4rem)]">
      <div
        className={`transition-all duration-300 ${collapsed ? "w-14" : "w-64"}`}
      >
        <ChatSidebar
          chats={chats}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onRefresh={fetchChats}
          currentChatId={currentChatId}
        />
      </div>
      <div className="flex-1 flex flex-col relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
        {/* Messages */}
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
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center text-lg text-white mb-4 absolute top-[30%] left-0 right-0 pb-211"
            >
              {promptText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll-To-Bottom */}
        {showScrollButton && (
          <button
            onClick={() =>
              chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
              })
            }
            className="fixed bottom-24 right-9 z-50 bg-zinc-800 text-white p-2 rounded-full shadow"
          >
            <ArrowDown size={18} />
          </button>
        )}

        {/* Chat Input */}
        <div className="px-4 py-3 bg-gradient-to-r from-zinc-700/70 via-black/80 to-zinc-700/70 backdrop-blur-lg border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
          <div className="flex gap-2 items-center w-full max-w-[50%] mx-auto">
            <TextareaAutosize
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your legal query…"
              maxRows={2}
              className="flex-grow resize-none bg-transparent text-white border border-zinc-700 rounded-full px-3 py-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400 transition-all duration-200 [&::-webkit-scrollbar]:w-2"
              style={{ lineHeight: "1.5" }}
            />
            <Button
              onClick={sendMessage}
              aria-label="Send message"
              className="bg-zinc-700 hover:bg-zinc-800 rounded-full px-3 py-2 h-fit transition-all duration-200"
              disabled={loading}
            >
              <PaperPlaneIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

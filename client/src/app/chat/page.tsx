"use client";
import { useState, useEffect, useRef } from "react";
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from "@/components/ui/button";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import ChatSidebar from "../components/Sidebar";
// import ChatSidebar from "../components/Sidebar";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { token } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

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

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // const userMsg: Message = { role: "user", content: trimmed };
    
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      let chatId = currentChatId;

      // Get assistant response
      const res = await fetch("http://localhost:8000/api/chat", {
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
        setCurrentChatId(data.chat_id); // Update currentChatId on new chat
      }

      const assistantMsg: Message = { role: "assistant", content: data.answer };
      console.log("Updating Messages State:", [...messages, assistantMsg]);
      setMessages((prev) => [...prev, { ...assistantMsg }]);
    } catch (err) {
      console.error("Chat error:", err);
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
      const res = await fetch(`http://localhost:8000/api/chats/${chatId}`, {
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
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className={`transition-all duration-300 ${collapsed ? "w-14" : "w-64"}`}>
        <ChatSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
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
          <motion.div
            key={`${msg.role}-${idx}-${msg.content.slice(0,10)}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-3 pb-7 mb-14 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-zinc-700/10 border-x-1 border-zinc/100 text-white text-right ml-auto"
                : "bg-zinc-200/0 border-y-1 border-y-white text-white text-left"
            }`}
          >
            {msg.content}
          </motion.div>
        ))}

        {loading && (
          <div className="text-left bg-zinc-200/0 border-y-1 border-y-white text-white p-3 rounded-xl animate-pulse max-w-[80%]">
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
          className="fixed bottom-14 right-5 z-50 bg-zinc-800 text-white p-2 rounded-full shadow"
        >
          ↓
        </button>
      )}

      {/* Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 z-10 bg-gradient-to-r from-zinc-700/70 via-black/80 to-zinc-700/70 backdrop-blur-lg border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div className="flex gap-2 items-center w-full max-w-[50%] mx-auto">
          <TextareaAutosize
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your legal query…"
            maxRows={2}
            className="flex-grow resize-none bg-transparent text-white border border-zinc-700 rounded-full px-3 py-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400 transition-all duration-200 [&::-webkit-scrollbar]:w-2
             [&::-webkit-scrollbar-track]:bg-transparent
             [&::-webkit-scrollbar-thumb]:rounded-full
             [&::-webkit-scrollbar-thumb]:bg-zinc-600
             hover:[&::-webkit-scrollbar-thumb]:bg-zinc-500"
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

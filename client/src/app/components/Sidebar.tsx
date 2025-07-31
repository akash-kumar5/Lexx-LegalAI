import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { PlusIcon } from "lucide-react";

interface ChatSummary {
  _id: string;
  title?: string;
  preview: string;
}

interface ChatSidebarProps {
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
  navbarHeight?: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function ChatSidebar({
  onSelectChat,
  onNewChat,
  currentChatId,
  navbarHeight = "64px",
  collapsed,
  setCollapsed,
}: ChatSidebarProps) {
  const { token } = useAuth();
  const [chats, setChats] = useState<ChatSummary[]>([]);

  useEffect(() => {
    if (!token) return;
    const fetchChats = async () => {
      const res = await fetch("http://localhost:8000/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    };
    fetchChats();
  }, [token]);

  return (
    <div
      className={`w-full h-full bg-zinc-900/90 backdrop-blur-md border-r border-zinc-700 flex flex-col`}
    >
      <div className="flex-shrink-0 relative group">
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand" : "Collapse"}
          className={`absolute top-4 right-[3px] bg-zinc-700 hover:bg-zinc-600 text-white p-1 rounded-full transition-opacity duration-300 ${
            collapsed ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          }`}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>

        {/* Logo / Icon (Always Visible) */}
        <div className="flex items-center h-13 ps-5 text-white text-xl font-bold border-b border-zinc-700">
          {collapsed ? "L" : "Chat"}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {collapsed ? (
            <button
              onClick={onNewChat}
              className="rounded-full hover:bg-zinc-700"
              aria-label="New Chat"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                onClick={onNewChat}
                className="bg-zinc-600 hover:bg-zinc-700 py-2 rounded-md mb-4 w-full"
              >
                + New Chat
              </button>

              <div className="space-y-2">
                {chats.map((chat) => (
                  <button
                    key={chat._id}
                    onClick={() => onSelectChat(chat._id)}
                    className={`block w-full text-left px-3 py-2 rounded hover:bg-zinc-700 ${
                      chat._id === currentChatId ? "bg-zinc-800" : ""
                    }`}
                  >
                    {chat.preview || chat._id}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Pencil, PlusIcon, Trash } from "lucide-react";

interface ChatSummary {
  _id: string;
  title?: string;
  preview: string;
  createdAt: string;
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
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const editingRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingRef.current &&
        !editingRef.current.contains(event.target as Node)
      ) {
        saveTitle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingChatId]);

  const saveTitle = () => {
    if (editingChatId && editingRef.current) {
      const newTitle = editingRef.current.value.trim();
      if (newTitle) {
        updateChatTitle(editingChatId, newTitle);
      } else {
        setEditingChatId(null);
      }
    }
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/chats/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === chatId ? { ...chat, title: newTitle } : chat
          )
        );
        setEditingChatId(null);
      }
    } catch (err) {
      console.error("Failed to rename chat:", err);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/chats/${chatId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (chatId === currentChatId) {
          onNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    await deleteChat(showDeleteConfirm);
    setShowDeleteConfirm(null);
  };

  const groupedChats = chats
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .reduce((groups: Record<string, ChatSummary[]>, chat) => {
      const date = new Date(chat.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(chat);
      return groups;
    }, {});

  return (
    <div className="w-full h-full bg-zinc-900/90 backdrop-blur-md border-r border-zinc-700 flex flex-col">
      {/* Header with Collapse Toggle */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-zinc-700 relative group">
        <span className="text-white text-xl font-bold">
          {collapsed ? "L" : "Chat"}
        </span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand" : "Collapse"}
          className={`bg-zinc-700 hover:bg-zinc-600 text-white p-1 rounded-full transition-opacity duration-300 ${
            collapsed ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          }`}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {collapsed ? (
          <button
            onClick={onNewChat}
            className="rounded-full hover:bg-zinc-700 p-2"
            aria-label="New Chat"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        ) : (
          <>
            <button
              onClick={onNewChat}
              className="bg-zinc-600 hover:bg-zinc-700 py-2 rounded-md mb-4 w-full text-white text-sm font-medium"
            >
              + New Chat
            </button>

            {/* Grouped Chats by Date */}
            <div className="space-y-4">
              {Object.entries(groupedChats).map(([date, chatList]) => (
                <div key={date}>
                  <div className="text-zinc-400 text-xs font-medium mb-1">{date}</div>
                  {chatList.map((chat) => (
                    <div key={chat._id} className="relative group">
                      {editingChatId === chat._id ? (
                        <input
                          ref={editingRef}
                          type="text"
                          defaultValue={chat.title || chat.preview || "Untitled Chat"}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveTitle();
                            }
                          }}
                          autoFocus
                          className="w-full bg-zinc-800 text-white text-sm px-3 py-2 rounded border border-zinc-600 outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => onSelectChat(chat._id)}
                          className={`block w-full text-left px-3 py-2 rounded text-white text-sm hover:bg-zinc-700 ${
                            chat._id === currentChatId ? "bg-zinc-800" : ""
                          }`}
                        >
                          {chat.preview || "Untitled Chat"}
                        </button>
                      )}

                      {/* Hover Actions */}
                      {!collapsed && (
                        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setEditingChatId(chat._id)}
                            className="text-zinc-400 hover:text-white text-xs"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(chat._id)}
                            className="text-zinc-400 hover:text-red-500 text-xs"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-6 rounded shadow">
            <p className="text-white mb-4">Are you sure you want to delete this chat?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={confirmDelete}
                className="bg-red-500 px-3 py-1 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-zinc-600 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

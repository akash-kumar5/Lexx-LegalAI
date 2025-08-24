"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
  Pencil,
  PlusIcon,
  Trash,
  MoreVertical,
  Copy,
  Upload,
} from "lucide-react";
import { exportChatToPDF } from "./ExportChat";

// A reusable hook for detecting clicks outside of a given element.
const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

interface ChatSummary {
  _id: string;
  title?: string;
  preview: string;
  createdAt: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
};

interface ChatSidebarProps {
  onSelectChat: (chatId: string) => void;
  chats: ChatSummary[];
  chatMessages: Message[];
  onNewChat: () => void;
  currentChatId: string | null;
  onRefresh: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function ChatSidebar({
  chats,
  chatMessages,
  onSelectChat,
  onNewChat,
  onRefresh,
  currentChatId,
  collapsed,
  setCollapsed,
}: ChatSidebarProps) {
  const { token } = useAuth();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);
  const [copiedChatId, setCopiedChatId] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const editingInputRef = useRef<HTMLInputElement>(null);
  const menuRef = React.createRef<HTMLDivElement>();
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // UX IMPROVEMENT: Use the custom hook to close the context menu when clicking outside.
  useClickOutside(menuRef as React.RefObject<HTMLDivElement>, () => setOpenMenuChatId(null));

  // UX IMPROVEMENT: Automatically focus the input when editing starts.
  useEffect(() => {
    if (editingChatId && editingInputRef.current) {
      editingInputRef.current.focus();
    }
  }, [editingChatId]);

  const saveTitle = () => {
    if (editingChatId && editingInputRef.current) {
      const newTitle = editingInputRef.current.value.trim();
      if (newTitle) {
        updateChatTitle(editingChatId, newTitle);
      }
    }
    setEditingChatId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveTitle();
    } else if (e.key === "Escape") {
      // UX IMPROVEMENT: Allow canceling edit with the Escape key.
      setEditingChatId(null);
    }
  };

  const handleStartEditing = (chatId: string) => {
    setOpenMenuChatId(null); // Close menu when starting edit
    setEditingChatId(chatId);
  };

  const handleStartDelete = (chatId: string) => {
    setOpenMenuChatId(null); // Close menu when opening delete confirm
    setShowDeleteConfirm(chatId);
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    // ... (fetch logic is unchanged)
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
        /* ... */
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to rename chat:", err);
    }
  };

  const deleteChat = async (chatId: string) => {
    // ... (fetch logic is unchanged)
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
        /* ... */
      });
      if (res.ok) {
        onRefresh();
        if (chatId === currentChatId) onNewChat();
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

  // UX IMPROVEMENT: Provide instant feedback without a disruptive `alert`.
  const copyChatLink = (chatId: string) => {
    const chatLink = `${window.location.origin}/chat/${chatId}`;
    navigator.clipboard.writeText(chatLink).then(() => {
      setSnackbarMessage("Chat link Copied!");
      setTimeout(() => setSnackbarMessage(null), 2000); // Reset after 2 seconds
    });
    setOpenMenuChatId(null);
  };

  // PERFORMANCE: Memoize the grouped chats to prevent recalculation on every render.
  const groupedChats = useMemo(() => {
    const groups: Record<string, ChatSummary[]> = {};
    const sortedChats = [...chats].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // UX IMPROVEMENT: Use human-friendly date grouping.
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    sortedChats.forEach((chat) => {
      const chatDate = new Date(chat.createdAt);
      let key: string;
      if (isSameDay(chatDate, today)) key = "Today";
      else if (isSameDay(chatDate, yesterday)) key = "Yesterday";
      else
        key = chatDate.toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
        });

      if (!groups[key]) groups[key] = [];
      groups[key].push(chat);
    });
    return groups;
  }, [chats]);

  return (
    <div
      className={`transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } h-full bg-zinc-900/90 backdrop-blur-md border-r border-zinc-700 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 h-14 px-3 border-b border-zinc-700 relative group">
        {!collapsed && (
          <span className="text-white text-lg font-bold">Conversations</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`absolute top-1/2 -translate-y-1/2 -right-3 z-10 bg-zinc-700 hover:bg-zinc-600 text-white p-1 rounded-full transition-all duration-300 ${
            collapsed ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-2">
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 py-2 rounded-md w-full text-white text-sm font-medium transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          {!collapsed && "New Chat"}
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {Object.entries(groupedChats).map(([date, chatList]) => (
          <div key={date}>
            {!collapsed && (
              <div className="text-zinc-400 text-xs font-medium mb-1 px-2">
                {date}
              </div>
            )}
            {chatList.map((chat) => (
              <div
                key={chat._id}
                className="relative group/item flex items-center"
              >
                {editingChatId === chat._id ? (
                  <input
                    ref={editingInputRef}
                    type="text"
                    defaultValue={chat.preview || chat.title}
                    autoFocus
                    onKeyDown={handleEditKeyDown}
                    onBlur={() => {
                      if (editingChatId === chat._id) saveTitle();
                    }} // Save when input loses focus
                    className="w-full bg-zinc-800 text-white text-sm px-3 py-2 rounded border border-zinc-600 outline-none"
                  />
                ) : (
                  <button
                    onClick={() => onSelectChat(chat._id)}
                    className={`block w-full text-left px-3 py-2 rounded text-white text-sm truncate hover:bg-zinc-700 transition-colors ${
                      chat._id === currentChatId ? "bg-zinc-800" : ""
                    }`}
                  >
                    {collapsed ? "C" : chat.preview || chat.title || "Untitled"}
                  </button>
                )}

                {!collapsed && editingChatId !== chat._id && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        setOpenMenuChatId(
                          openMenuChatId === chat._id ? null : chat._id
                        )
                      }
                      className="text-zinc-400 hover:text-white p-1"
                      aria-label="Chat options"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuChatId === chat._id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg flex flex-col z-10 text-sm"
                      >
                        <button
                          onClick={() => handleStartEditing(chat._id)}
                          className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-700"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => copyChatLink(chat._id)}
                          className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-700"
                        >
                          <Copy size={14} />{" "}
                          {copiedChatId === chat._id ? "Copied!" : "Share"}
                        </button>
                        <button
                          onClick={() =>
                            exportChatToPDF(
                              chat.title || "Untitled Chat",
                              chatMessages.map((msg) => ({
                                sender: msg.role,
                                text: msg.content,
                              }))
                            )
                          }
                          className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-700"
                        >
                          <Upload size={14} /> Export
                        </button>
                        <div className="border-t border-zinc-700 my-1"></div>
                        <button
                          onClick={() => handleStartDelete(chat._id)}
                          className="flex items-center gap-2 px-3 py-2 text-left text-red-500 hover:bg-zinc-700"
                        >
                          <Trash size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-6 rounded shadow">
            <p className="text-white mb-4">
              Are you sure you want to delete this chat?
            </p>
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
      {snackbarMessage && (
        <div className="fixed bottom-4 text-2ml left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-4 py-2 rounded shadow-md z-50 transition-opacity">
          {snackbarMessage}
        </div>
      )}
    </div>
  );
}

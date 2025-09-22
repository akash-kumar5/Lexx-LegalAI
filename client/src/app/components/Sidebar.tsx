"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
  Pencil,
  PlusIcon,
  Trash,
  MoreVertical,
  Copy,
  Upload,
} from "lucide-react";
const exportChatToPDF = (title: string, messages: any[]) => {
  console.log("Exporting to PDF:", title, messages);
  alert(`Exporting chat "${title}" to PDF... (feature placeholder)`);
};

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
}

interface ChatSidebarProps {
  onSelectChat: (chatId: string) => void;
  chats: ChatSummary[];
  chatMessages: Message[];
  onNewChat: () => void;
  currentChatId: string | null;
  onRefresh: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  token: string | null;
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
  token,
}: ChatSidebarProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [openMenu, setOpenMenu] = useState<{
    id: string | null;
    dir: "up" | "down";
  }>({
    id: null,
    dir: "down",
  });
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const editingInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  useClickOutside(menuRef, () => setOpenMenu({ id: null, dir: "down" }));

  useEffect(() => {
    if (editingChatId && editingInputRef.current) {
      editingInputRef.current.focus();
    }
  }, [editingChatId]);

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    if (!token) {
      setSnackbarMessage("Authentication error.");
      setTimeout(() => setSnackbarMessage(null), 3000);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        onRefresh();
        setSnackbarMessage("Chat renamed.");
        setTimeout(() => setSnackbarMessage(null), 3000);
      } else {
        throw new Error("Failed to rename chat");
      }
    } catch (err) {
      console.error("Failed to rename chat:", err);
      setSnackbarMessage("Error: Could not rename chat.");
      setTimeout(() => setSnackbarMessage(null), 3000);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!token) {
      setSnackbarMessage("Authentication error.");
      setTimeout(() => setSnackbarMessage(null), 3000);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        onRefresh();
        setSnackbarMessage("Chat deleted.");
        setTimeout(() => setSnackbarMessage(null), 3000);
        if (chatId === currentChatId) onNewChat();
      } else {
        throw new Error("Failed to delete chat");
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
      setSnackbarMessage("Error: Could not delete chat.");
      setTimeout(() => setSnackbarMessage(null), 3000);
    }
  };

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
      setEditingChatId(null);
    }
  };

  const handleMenuToggle = (e: React.MouseEvent, chatId: string) => {
    if (openMenu.id === chatId) {
      setOpenMenu({ id: null, dir: "down" });
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const opensUp = window.innerHeight - rect.bottom < 150;
    setOpenMenu({ id: chatId, dir: opensUp ? "up" : "down" });
  };

  const handleStartEditing = (chatId: string) => {
    setOpenMenu({ id: null, dir: "down" });
    setEditingChatId(chatId);
  };

  const handleStartDelete = (chatId: string) => {
    setOpenMenu({ id: null, dir: "down" });
    setShowDeleteConfirm(chatId);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    await deleteChat(showDeleteConfirm);
    setShowDeleteConfirm(null);
  };

  const copyChatLink = (chatId: string) => {
    const chatLink = `${window.location.origin}/chat/${chatId}`;
    navigator.clipboard.writeText(chatLink).then(() => {
      setSnackbarMessage("Chat link copied!");
      setTimeout(() => setSnackbarMessage(null), 2000);
    });
    setOpenMenu({ id: null, dir: "down" });
  };

  const groupedChats = useMemo(() => {
    const groups: Record<string, ChatSummary[]> = {};
    const sortedChats = [...chats].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
      <div className="flex items-center justify-between shrink-0 h-14 px-3 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          {!collapsed && (
            <span className="text-white text-lg font-bold">Chats</span>
          )}
        </div>

        {/* Collapse Toggle: always visible and accessible */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto flex items-center justify-center p-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
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
              <div className="text-zinc-400 text-xs font-medium mb-1 px-2 pt-2">
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
                    defaultValue={chat.preview || "New Chat"}
                    autoFocus
                    onKeyDown={handleEditKeyDown}
                    onBlur={saveTitle}
                    className="w-full bg-zinc-800 text-white text-sm px-3 py-2 rounded border border-zinc-600 outline-none"
                  />
                ) : (
                  <button
                    onClick={() => onSelectChat(chat._id)}
                    className={`block w-full text-left px-3 py-2 rounded text-white text-sm truncate hover:bg-zinc-700 transition-colors ${
                      chat._id === currentChatId ? "bg-zinc-800" : ""
                    }`}
                  >
                    {collapsed ? "" : chat.preview || "Untitled"}
                  </button>
                )}

                {!collapsed && editingChatId !== chat._id && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-2">
                    <div className="relative group backdrop-blur-sm">
                      <button
                        onClick={(e) => handleMenuToggle(e, chat._id)}
                        className="text-zinc-200 hover:text-white p-1"
                        aria-label="Chat options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenu.id === chat._id && (
                        <div
                          ref={menuRef}
                          className={`absolute right-0 w-36 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg flex flex-col z-20 text-sm backdrop-blur-sm
          ${openMenu.dir === "up" ? "bottom-full mb-1" : "top-full mt-1"}`}
                        >
                          <button
                            onClick={() => handleStartEditing(chat._id)}
                            className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-700 rounded-t-md"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() => copyChatLink(chat._id)}
                            className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-700"
                          >
                            <Copy size={14} /> Share
                          </button>
                          <button
                            onClick={() =>
                              exportChatToPDF(
                                chat.preview || "Untitled Chat",
                                chatMessages
                              )
                            }
                            className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-700"
                          >
                            <Upload size={14} /> Export
                          </button>
                          <div className="border-t border-zinc-700 my-1"></div>
                          <button
                            onClick={() => handleStartDelete(chat._id)}
                            className="flex items-center gap-2 px-3 py-2 text-left text-red-500 hover:bg-zinc-700 rounded-b-md"
                          >
                            <Trash size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-white text-lg font-semibold mb-2">
              Delete Chat
            </h3>
            <p className="text-zinc-300 mb-4">
              Are you sure you want to permanently delete this chat? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-zinc-600 hover:bg-zinc-500 text-white font-bold px-4 py-2 rounded-md transition-colors backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar for notifications */}
      {snackbarMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg shadow-md z-50 animate-pulse">
          {snackbarMessage}
        </div>
      )}
    </div>
  );
}

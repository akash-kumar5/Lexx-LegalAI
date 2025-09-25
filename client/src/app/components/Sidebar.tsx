"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Pencil, PlusIcon, Trash, MoreVertical, Copy, Upload } from "lucide-react";

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
  chatMessages: Message[]; // messages for the currently open chat
  onNewChat: () => void;
  currentChatId: string | null;
  onRefresh: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  token: string | null;
}

interface ChatMessageExport {
  sender?: string;
  text: string;
  timestamp?: string;
}

type ExportResult = { ok: boolean; url?: string; message?: string };

// Placeholder export function — typed return so callers can check `.ok` without casting.
const exportChatToPDF = async (title: string, messages: ChatMessageExport[]): Promise<ExportResult> => {
  console.log("Export to PDF (placeholder):", title, messages);
  return { ok: true };
};

const useClickOutside = (
  refs: React.RefObject<HTMLElement>[],
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    if (!refs || refs.length === 0) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      for (const ref of refs) {
        const el = ref.current;
        if (el && el.contains(event.target as Node)) {
          return;
        }
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [refs, handler]);
};

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<{ id: string | null; dir: "up" | "down" }>({ id: null, dir: "down" });
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarType, setSnackbarType] = useState<"info" | "error" | "success">("info");

  const editingInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const snackbarTimeoutRef = useRef<number | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const stableRefs = useMemo(() => [menuRef] as React.RefObject<HTMLElement>[], [menuRef]);
  const closeMenu = useCallback(() => setOpenMenu({ id: null, dir: "down" }), []);
  useClickOutside(stableRefs, closeMenu);

  useEffect(() => {
    if (editingChatId && editingInputRef.current) {
      editingInputRef.current.focus();
      editingInputRef.current.select();
    }
  }, [editingChatId]);

  const showSnackbar = useCallback(
    (msg: string, type: "info" | "error" | "success" = "info", ms = 2500) => {
      setSnackbarMessage(msg);
      setSnackbarType(type);
      if (snackbarTimeoutRef.current) {
        window.clearTimeout(snackbarTimeoutRef.current);
      }
      const id = window.setTimeout(() => {
        setSnackbarMessage(null);
      }, ms);
      snackbarTimeoutRef.current = id;
    },
    []
  );

  useEffect(() => {
    return () => {
      if (snackbarTimeoutRef.current) {
        window.clearTimeout(snackbarTimeoutRef.current);
      }
    };
  }, []);

  const updateChatTitle = useCallback(
    async (chatId: string, newTitle: string) => {
      if (!token) {
        showSnackbar("Authentication error.", "error");
        return;
      }
      if (!API_URL) {
        showSnackbar("Server configuration error.", "error");
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
          await onRefresh();
          showSnackbar("Chat renamed.", "success");
        } else {
          const txt = await res.text().catch(() => "Server error");
          console.error("rename failed:", txt);
          showSnackbar("Failed to rename chat.", "error");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Failed to rename chat:", message);
        showSnackbar("Error: Could not rename chat.", "error");
      }
    },
    [API_URL, onRefresh, token, showSnackbar]
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      if (!token) {
        showSnackbar("Authentication error.", "error");
        return;
      }
      if (!API_URL) {
        showSnackbar("Server configuration error.", "error");
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
          await onRefresh();
          showSnackbar("Chat deleted.", "success");
          if (chatId === currentChatId) onNewChat();
        } else {
          const txt = await res.text().catch(() => "Server error");
          console.error("delete failed:", txt);
          showSnackbar("Failed to delete chat.", "error");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Failed to delete chat:", message);
        showSnackbar("Error: Could not delete chat.", "error");
      }
    },
    [API_URL, currentChatId, onNewChat, onRefresh, token, showSnackbar]
  );

  const saveTitle = useCallback(() => {
    if (editingChatId && editingInputRef.current) {
      const newTitle = editingInputRef.current.value.trim();
      if (newTitle) {
        updateChatTitle(editingChatId, newTitle);
      }
    }
    setEditingChatId(null);
  }, [editingChatId, updateChatTitle]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveTitle();
      } else if (e.key === "Escape") {
        setEditingChatId(null);
      }
    },
    [saveTitle]
  );

  const handleMenuToggle = useCallback(
    (e: React.MouseEvent, chatId: string) => {
      if (openMenu.id === chatId) {
        setOpenMenu({ id: null, dir: "down" });
        return;
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const opensUp = window.innerHeight - rect.bottom < 150;
      setOpenMenu({ id: chatId, dir: opensUp ? "up" : "down" });
    },
    [openMenu.id]
  );

  const handleStartEditing = useCallback((chatId: string) => {
    setOpenMenu({ id: null, dir: "down" });
    setEditingChatId(chatId);
  }, []);

  const handleStartDelete = useCallback((chatId: string) => {
    setOpenMenu({ id: null, dir: "down" });
    setShowDeleteConfirm(chatId);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!showDeleteConfirm) return;
    await deleteChat(showDeleteConfirm);
    setShowDeleteConfirm(null);
  }, [deleteChat, showDeleteConfirm]);

  const copyChatLink = useCallback(
    (chatId: string) => {
      const chatLink = `${window.location.origin}/chat/${chatId}`;
      navigator.clipboard.writeText(chatLink).then(
        () => showSnackbar("Chat link copied!", "success", 2000),
        () => showSnackbar("Failed to copy link", "error", 2000)
      );
      setOpenMenu({ id: null, dir: "down" });
    },
    [showSnackbar]
  );

  const handleExportChat = useCallback(
    async (chatId: string, title?: string) => {
      if (!API_URL) {
        showSnackbar("Server configuration error.", "error");
        return;
      }
      if (!token) {
        showSnackbar("Authentication required.", "error");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "Server error");
          console.error("fetch chat for export failed:", txt);
          showSnackbar("Failed to load chat for export.", "error");
          return;
        }
        const messages: Message[] = await res.json();
        const exportMsgs: ChatMessageExport[] = messages.map((m) => ({
          sender: m.role,
          text: m.content,
          timestamp: undefined,
        }));
        const result = await exportChatToPDF(title ?? "Untitled Chat", exportMsgs);
        if (result.ok) {
          showSnackbar("Export started.", "success");
        } else {
          showSnackbar(result.message ?? "Export failed.", "error");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Export error:", message);
        showSnackbar("Export failed.", "error");
      } finally {
        setOpenMenu({ id: null, dir: "down" });
      }
    },
    [API_URL, showSnackbar, token]
  );

  const groupedChats = useMemo(() => {
    const groups: Record<string, ChatSummary[]> = {};
    const sortedChats = [...chats].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

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
      className={`
        transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
        h-full
        bg-white text-zinc-900 border-r border-zinc-200
        dark:bg-stone-900 dark:text-stone-100 dark:border-stone-700
        flex flex-col
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 h-14 px-3 border-b border-zinc-200 dark:border-stone-700">
        <div className="flex items-center gap-2">
          {!collapsed && <span className="text-zinc-900 dark:text-stone-100 text-lg font-bold">Chats</span>}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto flex items-center justify-center p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-stone-500"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <span className="text-zinc-700 dark:text-stone-200">
            {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
          </span>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-2">
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 py-2 rounded-md w-full transition-colors
            bg-zinc-900 text-white hover:bg-zinc-800
            dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
        >
          <PlusIcon className="w-5 h-5" />
          {!collapsed && "New Chat"}
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {Object.entries(groupedChats).map(([date, chatList]) => (
          <div key={date}>
            {!collapsed && <div className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-1 px-2 pt-2">{date}</div>}
            {chatList.map((chat) => (
              <div key={chat._id} className="relative group/item flex items-center">
                {editingChatId === chat._id ? (
                  <input
                    ref={editingInputRef}
                    type="text"
                    defaultValue={chat.preview || "New Chat"}
                    autoFocus
                    onKeyDown={handleEditKeyDown}
                    onBlur={saveTitle}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 outline-none"
                  />
                ) : (
                  <button
                    onClick={() => onSelectChat(chat._id)}
                    className={`block w-full text-left px-3 py-2 rounded text-sm truncate transition-colors
                      ${chat._id === currentChatId ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}
                      text-zinc-900 dark:text-zinc-100
                    `}
                  >
                    {collapsed ? "" : chat.preview || "Untitled"}
                  </button>
                )}

                {!collapsed && editingChatId !== chat._id && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-2">
                    <div className="relative group backdrop-blur-sm">
                      <button onClick={(e) => handleMenuToggle(e, chat._id)} className="text-zinc-700 dark:text-zinc-200 hover:text-black dark:hover:text-white p-1" aria-label="Chat options">
                        <MoreVertical size={16} />
                      </button>

                      {openMenu.id === chat._id && (
                        <div
                          ref={menuRef}
                          className={`absolute right-0 w-44 bg-white border border-zinc-200 rounded-md shadow-lg flex flex-col z-20 text-sm backdrop-blur-sm ${openMenu.dir === "up" ? "bottom-full mb-1" : "top-full mt-1"} dark:bg-zinc-900 dark:border-stone-700`}
                        >
                          <button onClick={() => handleStartEditing(chat._id)} className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-t-md">
                            <Pencil size={14} /> Edit
                          </button>

                          <button onClick={() => copyChatLink(chat._id)} className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            <Copy size={14} /> Share
                          </button>

                          <button onClick={() => handleExportChat(chat._id, chat.preview)} className="flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            <Upload size={14} /> Export
                          </button>

                          <div className="border-t border-zinc-200/40 my-1 dark:border-stone-700/40"></div>

                          <button onClick={() => handleStartDelete(chat._id)} className="flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-b-md">
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
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/60" aria-hidden />
          <div className="relative z-10 bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete Chat</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Are you sure you want to permanently delete this chat? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 rounded-md transition-colors bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-md transition-colors bg-red-600 hover:bg-red-500 text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbarMessage && (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-md z-50
            ${snackbarType === "error" ? "bg-red-600 text-white" : snackbarType === "success" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-white"}
            dark:bg-zinc-800
          `}
        >
          {snackbarMessage}
        </div>
      )}
    </div>
  );
}

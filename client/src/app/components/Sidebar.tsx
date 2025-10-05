"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Pencil, PlusIcon, Trash, MoreVertical, Copy, Upload } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

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

interface ChatMessageExport {
  sender?: string;
  text: string;
  timestamp?: string;
}

type ExportResult = { ok: boolean; url?: string; message?: string };

// Placeholder export function
const exportChatToPDF = async (
  title: string,
  messages: ChatMessageExport[]
): Promise<ExportResult> => {
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
        if (el && el.contains(event.target as Node)) return;
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
  const [openMenu, setOpenMenu] = useState<{ id: string | null; dir: "up" | "down" }>({
    id: null,
    dir: "down",
  });
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

  // lock body scroll when modal opens
  useEffect(() => {
    if (showDeleteConfirm) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showDeleteConfirm]);

  // close on Esc
  useEffect(() => {
    if (!showDeleteConfirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDeleteConfirm(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDeleteConfirm]);

  const showSnackbar = useCallback(
    (msg: string, type: "info" | "error" | "success" = "info", ms = 2500) => {
      setSnackbarMessage(msg);
      setSnackbarType(type);
      if (snackbarTimeoutRef.current) window.clearTimeout(snackbarTimeoutRef.current);
      const id = window.setTimeout(() => setSnackbarMessage(null), ms);
      snackbarTimeoutRef.current = id;
    },
    []
  );

  useEffect(() => {
    return () => {
      if (snackbarTimeoutRef.current) window.clearTimeout(snackbarTimeoutRef.current);
    };
  }, []);

  const updateChatTitle = useCallback(
    async (chatId: string, newTitle: string) => {
      if (!token) return showSnackbar("Authentication error.", "error");
      if (!API_URL) return showSnackbar("Server configuration error.", "error");

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
      if (!token) return showSnackbar("Authentication error.", "error");
      if (!API_URL) return showSnackbar("Server configuration error.", "error");

      try {
        const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
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
      if (newTitle) updateChatTitle(editingChatId, newTitle);
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
      if (!API_URL) return showSnackbar("Server configuration error.", "error");
      if (!token) return showSnackbar("Authentication required.", "error");

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
        }));
        const result = await exportChatToPDF(title ?? "Untitled Chat", exportMsgs);
        if (result.ok) showSnackbar("Export started.", "success");
        else showSnackbar(result.message ?? "Export failed.", "error");
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
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    sortedChats.forEach((chat) => {
      const chatDate = new Date(chat.createdAt);
      let key: string;
      if (isSameDay(chatDate, today)) key = "Today";
      else if (isSameDay(chatDate, yesterday)) key = "Yesterday";
      else
        key = chatDate.toLocaleDateString(undefined, { month: "long", day: "numeric" });
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
        h-full flex flex-col
        bg-white/75 border-r border-zinc-200 backdrop-blur-sm
        dark:bg-zinc-950/50 dark:border-white/10
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-zinc-200 dark:border-white/10">
        {!collapsed && (
          <span className="text-lg font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
            Chats
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto grid place-items-center h-7 w-7 rounded-full ring-1 ring-zinc-300 text-zinc-700 hover:bg-zinc-100
                     dark:ring-zinc-600 dark:text-zinc-200 dark:hover:bg-white/5"
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
          className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-full
                    text-sm font-medium transition-colors
                    bg-zinc-900 text-white hover:bg-zinc-800
                    dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
        >
          <PlusIcon className="h-4 w-4" /> {!collapsed && "New Chat"}
        </button>
      </div>

      {/* Chat List */}
      <div
        className="flex-1 overflow-y-auto px-2 space-y-3
                   [scrollbar-width:thin] [scrollbar-color:theme(colors.zinc.400)_transparent]
                   dark:[scrollbar-color:theme(colors.zinc.700)_transparent]"
      >
        {Object.entries(groupedChats).map(([date, chatList]) => (
          <div key={date}>
            {!collapsed && (
              <div
                className="sticky top-0 z-10 -mx-2 px-4 py-1.5 text-[11px] uppercase tracking-wide
                           bg-white/85 text-zinc-500 border-b border-zinc-200
                           dark:bg-zinc-950/80 dark:text-zinc-400 dark:border-white/5 backdrop-blur"
              >
                {date}
              </div>
            )}
            <ul className="mt-1 space-y-1">
              {chatList.map((chat) => {
                const active = chat._id === currentChatId;
                return (
                  <li key={chat._id} className="group relative">
                    {editingChatId === chat._id ? (
                      <input
                        ref={editingInputRef}
                        type="text"
                        defaultValue={chat.preview || "New Chat"}
                        autoFocus
                        onKeyDown={handleEditKeyDown}
                        onBlur={saveTitle}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none
                                   bg-white border border-zinc-300 text-zinc-900
                                   focus:ring-2 focus:ring-zinc-300
                                   dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:ring-zinc-600"
                      />
                    ) : (
                      <button
                        onClick={() => onSelectChat(chat._id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition
                          ${
                            active
                              ? "bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200 dark:bg-white/10 dark:text-zinc-50 dark:ring-white/10"
                              : "hover:bg-zinc-100/70 text-zinc-800 dark:hover:bg-white/5 dark:text-zinc-200"
                          }`}
                        title={chat.preview || "Untitled"}
                      >
                        {collapsed ? "" : chat.preview || "Untitled"}
                      </button>
                    )}

                    {!collapsed && editingChatId !== chat._id && (
                      <div className="absolute inset-y-0 right-1 flex items-center">
                        <button
                          onClick={(e) => handleMenuToggle(e, chat._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5
                                     rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100
                                     dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/10"
                          aria-label="Chat options"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    )}

                    {openMenu.id === chat._id && (
                      <div
                        ref={menuRef}
                        className={`absolute z-50 right-0 mt-2 w-44 rounded-md overflow-hidden shadow-xl text-sm
                                    border bg-white text-zinc-900
                                    dark:border-white/10 dark:bg-zinc-950/95 dark:text-zinc-100 backdrop-blur`}
                        style={{
                          top: openMenu.dir === "up" ? "auto" : "100%",
                          bottom: openMenu.dir === "up" ? "100%" : "auto",
                          marginTop: openMenu.dir === "up" ? undefined : "0.5rem",
                          marginBottom: openMenu.dir === "up" ? "0.5rem" : undefined,
                        }}
                      >
                        <button
                          onClick={() => handleStartEditing(chat._id)}
                          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-100 text-left dark:hover:bg-white/5"
                        >
                          <Pencil size={14} /> Rename
                        </button>
                        <button
                          onClick={() => copyChatLink(chat._id)}
                          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-100 text-left dark:hover:bg-white/5"
                        >
                          <Copy size={14} /> Share
                        </button>
                        <button
                          onClick={() => handleExportChat(chat._id, chat.preview)}
                          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-100 text-left dark:hover:bg-white/5"
                        >
                          <Upload size={14} /> Export
                        </button>
                        <div className="h-px bg-zinc-200 dark:bg-white/10" />
                        <button
                          onClick={() => handleStartDelete(chat._id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 text-left dark:text-red-400 dark:hover:bg-white/5"
                        >
                          <Trash size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-sm p-6 rounded-2xl bg-white text-zinc-900 shadow-2xl border border-zinc-200
                            dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700">
              <h3 className="text-lg font-semibold mb-2 text-center">Delete Chat</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 text-center">
                Are you sure you want to delete this chat? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-5 py-2 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-900
                             dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Snackbar */}
      {snackbarMessage &&
        createPortal(
          <AnimatePresence>
            <motion.div
              key="snackbar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed left-1/2 -translate-x-1/2 z-[70]
                         bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
              onClick={() => setSnackbarMessage(null)}
            >
              <div
                role={snackbarType === "error" ? "alert" : "status"}
                className={`max-w-[90vw] sm:max-w-md px-4 py-2 rounded-lg shadow-lg cursor-pointer backdrop-blur
                  text-white
                  ${
                    snackbarType === "error"
                      ? "bg-red-600/95"
                      : snackbarType === "success"
                      ? "bg-emerald-600/95"
                      : "bg-zinc-800/95"
                  }`}
              >
                <span className="block truncate">{snackbarMessage}</span>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

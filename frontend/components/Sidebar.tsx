"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserPublic } from "@/types";

interface SidebarProps {
  users: UserPublic[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-indigo-400 to-cyan-500",
];

export default function Sidebar({ users, selectedId, onSelect, loading }: SidebarProps) {
  return (
    <aside className="w-full lg:w-80 shrink-0 flex flex-col bg-white h-auto lg:h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-sm tracking-wide truncate">All Profiles</h2>
            <p className="text-indigo-200 text-xs">{users.length} members • Scroll to view all</p>
          </div>
        </div>
      </div>

      {/* User List - Mobile scrollable height, desktop full height */}
      <div className="overflow-y-auto py-2 custom-scrollbar max-h-56 sm:max-h-64 lg:max-h-none lg:flex-1 overscroll-contain">
        {loading ? (
          <div className="flex flex-col gap-2 p-3 sm:p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-3 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4 mb-2" />
                  <div className="h-2 bg-slate-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">No profiles yet</p>
            <p className="text-slate-400 text-xs mt-0.5">Upload a CSV to get started</p>
          </div>
        ) : (
          <AnimatePresence>
            {users.map((user, idx) => {
              const isActive = user.id === selectedId;
              const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              return (
                <motion.button
                  key={user.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.25 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(user.id)}
                  className={`w-full flex items-center gap-3 px-3.5 sm:px-4 py-3 mx-2 my-1 rounded-xl text-left transition-all duration-200 cursor-pointer touch-manipulation group min-h-[48px]
                    ${isActive
                      ? "bg-indigo-50 shadow-sm border border-indigo-200/80 text-indigo-600 sm:translate-x-1"
                      : "hover:bg-indigo-50/60 active:bg-indigo-50/80 hover:text-indigo-600 border border-transparent hover:border-indigo-100"
                    }`}
                  style={{ width: "calc(100% - 16px)" }}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm`}>
                    {getInitials(user.name)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors ${isActive ? "text-indigo-700" : "text-slate-800 group-hover:text-indigo-600"}`}>
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.department || "—"}</p>
                  </div>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}

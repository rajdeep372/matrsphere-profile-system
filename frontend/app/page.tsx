"use client";

import { useState, useCallback, useEffect } from "react";
import { fetchUsers, unmaskUser } from "@/lib/api";
import { UserPublic, UserUnmasked } from "@/types";
import Sidebar from "@/components/Sidebar";
import ProfileDetail from "@/components/ProfileDetail";
import ConsentModal from "@/components/ConsentModal";
import CsvUploader from "@/components/CsvUploader";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [unmaskedData, setUnmaskedData] = useState<UserUnmasked | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingUnmask, setLoadingUnmask] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function initUsers() {
      try {
        const data = await fetchUsers();
        if (!ignore) {
          setUsers(data);
          setLoadingUsers(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load users");
          setLoadingUsers(false);
        }
      }
    }
    initUsers();
    return () => {
      ignore = true;
    };
  }, []);

  const selectedUser = users.find((u) => u.id === selectedId) ?? null;

  const handleSelectUser = (id: number) => {
    if (id !== selectedId) {
      setSelectedId(id);
      setUnmaskedData(null); // hide PII when switching users
    }
  };

  const handleShowHidden = () => {
    setIsConsentOpen(true);
  };

  const handleConsentAgree = async () => {
    if (!selectedId) return;
    setLoadingUnmask(true);
    try {
      const data = await unmaskUser(selectedId);
      setUnmaskedData(data);
      setIsConsentOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to unmask user");
      setIsConsentOpen(false);
    } finally {
      setLoadingUnmask(false);
    }
  };

  const handleConsentDecline = () => {
    setIsConsentOpen(false);
  };

  const handleHidePii = () => {
    setUnmaskedData(null);
  };

  return (
    <div className="flex flex-col min-h-screen lg:h-screen bg-slate-50 overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      {/* Top Navbar */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="shrink-0 bg-white border-b border-slate-100 shadow-sm z-20 sticky top-0"
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-none">MatrSphere</h1>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-none mt-1">Profile System</p>
            </div>
          </div>

          {/* Stats pill */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 sm:px-3.5 py-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-indigo-600">{users.length} profiles</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-emerald-600">Encrypted</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Error Banner */}
      {error && (
        <div className="shrink-0 bg-red-50 border-b border-red-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-xs sm:text-sm">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-4 p-1 touch-manipulation">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Layout: Stacks vertically on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-visible lg:overflow-hidden">
        {/* Left Panel: Top on mobile, Left sidebar on desktop */}
        <div className="w-full lg:w-80 flex flex-col shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-100 shadow-sm lg:shadow-none">
          <CsvUploader onSuccess={loadUsers} />
          <div className="flex-1 overflow-visible lg:overflow-hidden">
            <Sidebar
              users={users}
              selectedId={selectedId}
              onSelect={handleSelectUser}
              loading={loadingUsers}
            />
          </div>
        </div>

        {/* Right Panel: Bottom on mobile, Right pane on desktop */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-visible lg:overflow-hidden">
          <ProfileDetail
            user={selectedUser}
            unmaskedData={unmaskedData}
            loading={loadingUnmask}
            onShowHidden={handleShowHidden}
            onHide={handleHidePii}
          />
        </div>
      </div>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={isConsentOpen}
        userName={selectedUser?.name ?? ""}
        onAgree={handleConsentAgree}
        onDecline={handleConsentDecline}
        isLoading={loadingUnmask}
      />
    </div>
  );
}

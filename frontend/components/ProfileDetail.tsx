"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserPublic, UserUnmasked } from "@/types";

interface ProfileDetailProps {
  user: UserPublic | null;
  unmaskedData: UserUnmasked | null;
  loading: boolean;
  onShowHidden: () => void;
  onHide: () => void;
}

const MASK = "••••••••••••";

function DetailRow({ label, value, masked = false, icon }: {
  label: string;
  value: string | null;
  masked?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 ${
      masked
        ? "bg-slate-100/70 border border-dashed border-slate-300/80 shadow-sm"
        : "bg-white border border-slate-100 shadow-md hover:shadow-lg hover:-translate-y-0.5"
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
        masked ? "bg-slate-200 text-slate-400" : "bg-indigo-50 text-indigo-600"
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        {masked ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-sm tracking-widest select-none">{MASK}</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200/80 text-slate-600">
              Hidden
            </span>
          </div>
        ) : (
          <p className="text-slate-800 font-semibold text-sm break-words">{value || "—"}</p>
        )}
      </div>
    </div>
  );
}

const icons = {
  name: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  email: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  edu: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
  addr: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  dept: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  project: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  loc: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  gender: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  phone: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  account: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  govId: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>,
};

export default function ProfileDetail({ user, unmaskedData, loading, onShowHidden, onHide }: ProfileDetailProps) {
  const isPiiVisible = !!unmaskedData;

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6 sm:p-10 min-h-[300px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-1 sm:mb-2">Select a Profile</h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xs px-2">
            Choose a user from the list above on mobile or sidebar on desktop to view full details.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={user.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="flex-1 flex flex-col bg-slate-50 overflow-visible lg:overflow-hidden"
      >
        {/* Profile Header */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg shadow-indigo-200 shrink-0">
                {user.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{user.name}</h1>
                <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                  {user.department && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-indigo-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {user.department}
                    </span>
                  )}
                  {user.location && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {user.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PII Action button - touch friendly & full-width on mobile */}
            <div className="w-full sm:w-auto shrink-0">
              {isPiiVisible ? (
                <button
                  id="hide-pii-btn"
                  onClick={onHide}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 active:scale-95 touch-manipulation transition-all duration-200 min-h-[44px]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  Hide Fields
                </button>
              ) : (
                <button
                  id="show-hidden-btn"
                  onClick={onShowHidden}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold
                    hover:from-indigo-700 hover:to-violet-700 active:scale-95 touch-manipulation transition-all duration-200 shadow-md shadow-indigo-200
                    disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Show Hidden Fields
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Body */}
        <div className="flex-1 overflow-visible lg:overflow-y-auto px-4 sm:px-8 py-5 sm:py-6 custom-scrollbar">
          {/* PII Status Banner */}
          <AnimatePresence>
            {isPiiVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 sm:p-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-700">PII Fields Decrypted</p>
                    <p className="text-[11px] sm:text-xs text-emerald-600">Consent recorded. Sensitive fields are now visible.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid of Non-PII Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <DetailRow label="Full Name" value={user.name} icon={icons.name} />
            <DetailRow label="Email ID" value={user.email_id} icon={icons.email} />
            <DetailRow label="Gender" value={user.gender} icon={icons.gender} />
            <DetailRow label="Education" value={user.education} icon={icons.edu} />
            <DetailRow label="Department" value={user.department} icon={icons.dept} />
            <DetailRow label="Project" value={user.project} icon={icons.project} />
            <DetailRow label="Location" value={user.location} icon={icons.loc} />
            <DetailRow label="Address" value={user.address} icon={icons.addr} />
          </div>

          {/* PII Section */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest px-2 text-center">
                {isPiiVisible ? "🔓 Sensitive Fields (Decrypted)" : "🔒 Sensitive Fields (Encrypted at Rest)"}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <DetailRow
                label="Contact Number"
                value={unmaskedData?.contact_number ?? null}
                masked={!isPiiVisible}
                icon={icons.phone}
              />
              <DetailRow
                label="Account Number"
                value={unmaskedData?.account_number ?? null}
                masked={!isPiiVisible}
                icon={icons.account}
              />
              <DetailRow
                label="Government ID"
                value={unmaskedData?.government_id ?? null}
                masked={!isPiiVisible}
                icon={icons.govId}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

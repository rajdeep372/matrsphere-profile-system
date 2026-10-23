"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

interface ConsentModalProps {
  isOpen: boolean;
  userName: string;
  onAgree: () => void;
  onDecline: () => void;
  isLoading: boolean;
}

export default function ConsentModal({
  isOpen,
  userName,
  onAgree,
  onDecline,
  isLoading,
}: ConsentModalProps) {
  const agreeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Trap focus on open
      agreeRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onDecline();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onDecline]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            onClick={onDecline}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consent-modal-title"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 to-violet-600 shrink-0 sticky top-0" />

              <div className="p-5 sm:p-8">
                {/* Icon */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <h2 id="consent-modal-title" className="text-lg sm:text-xl font-bold text-slate-800 text-center mb-2">
                  PII Access Consent Required
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm text-center leading-relaxed mb-4 sm:mb-6">
                  You are requesting access to sensitive personally identifiable information (PII) for{" "}
                  <span className="font-semibold text-indigo-600">{userName}</span>.
                </p>

                {/* Warning box */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 mb-5 sm:mb-6">
                  <div className="flex gap-2.5 sm:gap-3">
                    <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-amber-800 text-xs font-semibold mb-1">Sensitive Data Warning</p>
                      <ul className="text-amber-700 text-xs space-y-0.5 list-disc list-inside">
                        <li>Contact Number</li>
                        <li>Account Number</li>
                        <li>Government ID</li>
                      </ul>
                      <p className="text-amber-700 text-[11px] sm:text-xs mt-2">
                        This action is logged for regulatory compliance. Only proceed if authorized.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  <button
                    ref={agreeRef}
                    id="consent-agree-btn"
                    onClick={onAgree}
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm
                      hover:from-indigo-700 hover:to-violet-700 active:scale-95 touch-manipulation transition-all duration-200 shadow-md shadow-indigo-200
                      disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Decrypting…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                        I Agree — Reveal Hidden Fields
                      </>
                    )}
                  </button>
                  <button
                    id="consent-decline-btn"
                    onClick={onDecline}
                    disabled={isLoading}
                    className="w-full py-3 px-6 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm
                      hover:bg-slate-50 active:scale-95 touch-manipulation transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

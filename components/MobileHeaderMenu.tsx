"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { Menu, X, Folder, Coffee, Sparkles, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UI_STRINGS } from "@/lib/uiStrings";

interface MobileHeaderMenuProps {
  locale?: "ro" | "en" | "es";
  user: User | null;
  isAdmin?: boolean;
  hasProAccess?: boolean;
  hasStandardAccess?: boolean;
  subscriptionActive?: boolean;
  onOpenCoffee: () => void;
  onOpenPricing?: () => void;
  onRequireLogin?: () => void;
  onLogout: () => Promise<void> | void;
}

export function MobileHeaderMenu({
  locale = "ro",
  user,
  isAdmin = false,
  hasProAccess = false,
  hasStandardAccess = false,
  subscriptionActive = false,
  onOpenCoffee,
  onOpenPricing,
  onRequireLogin,
  onLogout,
}: MobileHeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const ui = UI_STRINGS[locale] || UI_STRINGS.ro;
  const isEn = locale === "en";
  const isEs = locale === "es";

  // Închidere la click în exterior
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Închidere la apăsare Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const getUserBadge = () => {
    if (isAdmin) return { label: "Admin", bg: "bg-red-500/20 text-red-400 border-red-500/40" };
    if (hasProAccess || subscriptionActive) return { label: "PRO", bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" };
    if (hasStandardAccess) return { label: "Standard", bg: "bg-blue-500/20 text-blue-400 border-blue-500/40" };
    return { label: isEn ? "Free" : isEs ? "Gratis" : "Gratuit", bg: "bg-zinc-800 text-zinc-400 border-zinc-700" };
  };

  const badge = getUserBadge();

  return (
    <div className="relative" ref={menuRef}>
      {/* Buton declanșator mobil (Tap Target ≥44px) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isEn ? "Open navigation menu" : isEs ? "Abrir menú de navegación" : "Deschide meniul de navigare"}
        className="flex items-center justify-center p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all min-w-[44px] min-h-[44px] active:scale-95 shadow-sm"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-emerald-400" />
        ) : user ? (
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[11px] font-black text-emerald-400">
              {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <Menu className="w-4 h-4 text-zinc-400" />
          </div>
        ) : (
          <Menu className="w-5 h-5 text-zinc-300" />
        )}
      </button>

      {/* Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu Container */}
      {isOpen && (
        <div className="absolute right-0 top-12 mt-2 w-72 max-w-[calc(100vw-24px)] bg-zinc-900/95 border border-zinc-800/90 rounded-2xl shadow-2xl backdrop-blur-xl z-50 p-3 flex flex-col gap-2 animate-in slide-in-from-top-2 zoom-in-95 duration-150 text-sm">
          
          {/* Antet Utilizator */}
          {user ? (
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                  {isEn ? "Logged in as" : isEs ? "Conectado como" : "Conectat ca"}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate" title={user.email || ""}>
                {user.email}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60 flex flex-col gap-2">
              <p className="text-xs text-zinc-400">
                {isEn ? "Save and access your plans anytime." : isEs ? "Guarda y accede a tus planes siempre." : "Salvează și accesează planurile oricând."}
              </p>
              {onRequireLogin ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onRequireLogin();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-all active:scale-95 min-h-[44px]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{ui.logIn}</span>
                </button>
              ) : (
                <Link
                  href={ui.routes.login}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-all active:scale-95 min-h-[44px]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{ui.logIn}</span>
                </Link>
              )}
            </div>
          )}

          {/* Secțiune Navigație Rapidă */}
          <div className="flex flex-col gap-1 py-1">
            {user && (
              <Link
                href={ui.routes.dashboard}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800/60 text-zinc-200 hover:text-white font-semibold transition-colors min-h-[44px]"
              >
                <Folder className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{ui.myPlans}</span>
              </Link>
            )}

            {onOpenPricing && !subscriptionActive && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenPricing();
                }}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-800/60 text-zinc-200 hover:text-white font-semibold transition-colors min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{ui.pricing}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCoffee();
              }}
              className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-800/60 text-zinc-200 hover:text-white font-semibold transition-colors min-h-[44px]"
            >
              <Coffee className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>{ui.buyMeACoffee}</span>
            </button>
          </div>

          {/* Selector Limbă integrat */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between px-2 py-1">
            <span className="text-xs text-zinc-400 font-medium">
              {isEn ? "Language" : isEs ? "Idioma" : "Limbă"}
            </span>
            <LanguageSwitcher currentLocale={locale} />
          </div>

          {/* Deconectare */}
          {user && (
            <div className="pt-1 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={async () => {
                  setIsOpen(false);
                  await onLogout();
                }}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 font-semibold transition-colors min-h-[44px]"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>{ui.logOut}</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

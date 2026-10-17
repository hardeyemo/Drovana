"use client";

import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "drovna-cookie-consent-v1";
const SETTINGS_EVENT = "drovna:open-cookie-settings";
const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

type Consent = {
  version: 1;
  essential: true;
  analytics: boolean;
  personalization: boolean;
  savedAt: string;
};

function readConsent(): Consent | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!value || typeof value !== "object") return null;
    const candidate = value as Partial<Consent>;
    if (candidate.version !== 1 || typeof candidate.analytics !== "boolean" || typeof candidate.personalization !== "boolean") return null;
    const savedAt = typeof candidate.savedAt === "string" ? Date.parse(candidate.savedAt) : Number.NaN;
    const now = Date.now();
    if (!Number.isFinite(savedAt) || savedAt > now + 5 * 60 * 1000 || now - savedAt > CONSENT_MAX_AGE_MS) return null;
    return {
      version: 1,
      essential: true,
      analytics: candidate.analytics,
      personalization: candidate.personalization,
      savedAt: new Date(savedAt).toISOString(),
    };
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [personalization, setPersonalization] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const consent = readConsent();
    if (consent) {
      setAnalytics(consent.analytics);
      setPersonalization(consent.personalization);
    } else {
      setVisible(true);
    }
    setReady(true);

    const openSettings = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setPersonalization(current?.personalization ?? false);
      setSettingsOpen(true);
      setVisible(true);
    };
    window.addEventListener(SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(SETTINGS_EVENT, openSettings);
  }, []);

  function saveConsent(nextAnalytics: boolean, nextPersonalization: boolean) {
    const consent: Consent = {
      version: 1,
      essential: true,
      analytics: nextAnalytics,
      personalization: nextPersonalization,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      setStorageError(false);
      setAnalytics(nextAnalytics);
      setPersonalization(nextPersonalization);
      setSettingsOpen(false);
      setVisible(false);
    } catch {
      setStorageError(true);
      setSettingsOpen(true);
      setVisible(true);
    }
  }

  if (!ready || !visible) return null;

  return (
    <aside
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-h-[85dvh] max-w-3xl overflow-y-auto rounded-2xl border border-[#dfe4dc] bg-white p-4 shadow-[0_16px_60px_-18px_rgba(24,45,39,.35)] sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl bg-[#f4f5ef] text-[#456349]"><Cookie className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 id="cookie-consent-title" className="font-display text-lg font-semibold text-[#263d32]">Your cookie choices</h2>
          <p id="cookie-consent-description" className="mt-1 text-sm leading-relaxed text-[#68766d]">
            Drovna uses essential session storage for sign-in and security. We do not currently load analytics or advertising cookies. Optional tools will remain off unless you choose to allow them.
          </p>
        </div>
      </div>

      {settingsOpen && (
        <div className="mt-4 space-y-3 border-t border-[#edf0e9] pt-4">
          <p className="text-xs leading-relaxed text-[#78847b]">Your choices are saved in this browser and can be changed at any time from the footer. The required preference record is stored locally.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#f7f8f5] p-3">
              <p className="text-sm font-semibold text-[#34483a]">Essential <span className="text-xs font-medium text-[#68766d]">Always active</span></p>
              <p className="mt-1 text-xs leading-relaxed text-[#78847b]">Needed for account sessions and security.</p>
            </div>
            <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-[#e6e9e2] p-3">
              <span><span className="block text-sm font-semibold text-[#34483a]">Analytics</span><span className="mt-1 block text-xs leading-relaxed text-[#78847b]">No analytics cookies are currently active.</span></span>
              <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="mt-1 size-4 accent-[#de7844]" />
            </label>
            <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-[#e6e9e2] p-3">
              <span><span className="block text-sm font-semibold text-[#34483a]">Personalization</span><span className="mt-1 block text-xs leading-relaxed text-[#78847b]">No personalization cookies are currently active.</span></span>
              <input type="checkbox" checked={personalization} onChange={(event) => setPersonalization(event.target.checked)} className="mt-1 size-4 accent-[#de7844]" />
            </label>
          </div>
          <button type="button" onClick={() => saveConsent(analytics, personalization)} className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#263d32] px-5 text-sm font-semibold text-white transition hover:bg-[#344d3d] sm:w-auto">Save my choices</button>
        </div>
      )}

      {storageError && <p role="alert" className="mt-3 text-sm text-[#a23e32]">Your browser could not save this choice. Check its storage settings and try again.</p>}

      {!settingsOpen && <p className="mt-3 text-xs leading-relaxed text-[#78847b]">Accepting or rejecting optional cookies does not affect essential sign-in and checkout functions. Read our <a href="/terms" className="font-semibold text-[#3d6048] underline underline-offset-2">Terms &amp; Conditions</a>.</p>}

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => saveConsent(true, true)} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#de7844] px-4 text-sm font-semibold text-white transition hover:bg-[#c96232]">Accept All</button>
        <button type="button" onClick={() => saveConsent(false, false)} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8ded7] bg-white px-4 text-sm font-semibold text-[#34483a] transition hover:bg-[#f6f7f3]">Reject Optional</button>
        <button type="button" aria-expanded={settingsOpen} onClick={() => setSettingsOpen((open) => !open)} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8ded7] bg-white px-4 text-sm font-semibold text-[#34483a] transition hover:bg-[#f6f7f3]">{settingsOpen ? "Close Settings" : "Cookie Settings"}</button>
      </div>
    </aside>
  );
}

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(SETTINGS_EVENT))}
      className="text-sm text-navy-200 underline underline-offset-4 hover:text-white"
    >
      Cookie settings
    </button>
  );
}

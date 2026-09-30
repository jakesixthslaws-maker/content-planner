import { useState } from "react";

const enc = encodeURIComponent;

// "intent" platforms accept prefilled text through a URL.
// "copy" platforms (Instagram, TikTok) have no prefill link, so we copy the
// caption to the clipboard and open the app's upload page.
export const PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", mode: "intent", url: (t) => `https://www.linkedin.com/feed/?shareActive=true&text=${enc(t)}` },
  { id: "x", name: "X", mode: "intent", url: (t) => `https://x.com/intent/post?text=${enc(t)}` },
  { id: "threads", name: "Threads", mode: "intent", url: (t) => `https://www.threads.net/intent/post?text=${enc(t)}` },
  { id: "instagram", name: "Instagram", mode: "copy", url: () => "https://www.instagram.com/" },
  { id: "tiktok", name: "TikTok", mode: "copy", url: () => "https://www.tiktok.com/upload" },
];

export default function ShareBar({ text }) {
  const [toast, setToast] = useState("");

  const go = (p) => {
    // open first, synchronously, so popup blockers don't stop it
    window.open(p.url(text), "_blank", "noopener,noreferrer");
    if (p.mode === "copy") {
      navigator.clipboard?.writeText(text).catch(() => {});
      setToast(`Caption copied. Paste it into ${p.name}.`);
      setTimeout(() => setToast(""), 3500);
    }
  };

  return (
    <div className="share">
      <span className="share-label">Post to</span>
      {PLATFORMS.map((p) => (
        <button key={p.id} className="share-btn" onClick={() => go(p)} disabled={!text?.trim()}>
          {p.name}
        </button>
      ))}
      {toast && <span className="share-toast" role="status">{toast}</span>}
    </div>
  );
}
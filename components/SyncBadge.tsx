"use client";

import { useStore } from "@/hooks/useStore";

export default function SyncBadge() {
  const { syncStatus, online, cloud } = useStore();

  let text: string;
  let dot: string;
  let bg: string;

  if (!cloud) {
    text = "Saved on this device";
    dot = "bg-stone-400";
    bg = "bg-stone-100 text-stone-600";
  } else if (!online || syncStatus === "offline") {
    text = "Offline — saved on device";
    dot = "bg-amber-400";
    bg = "bg-amber-50 text-amber-700";
  } else if (syncStatus === "saving") {
    text = "Syncing…";
    dot = "bg-sky-400 animate-pulse";
    bg = "bg-sky-50 text-sky-700";
  } else if (syncStatus === "error") {
    text = "Will retry sync";
    dot = "bg-amber-400";
    bg = "bg-amber-50 text-amber-700";
  } else if (syncStatus === "saved") {
    text = "Saved to cloud ✓";
    dot = "bg-emerald-400";
    bg = "bg-emerald-50 text-emerald-700";
  } else {
    text = "All saved";
    dot = "bg-emerald-400";
    bg = "bg-emerald-50 text-emerald-700";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${bg}`}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {text}
    </span>
  );
}

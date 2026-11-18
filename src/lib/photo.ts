import { useEffect, useState } from "react";

const key = (id: string) => `applicant-photo:${id}`;
const EVENT = "applicant-photo-change";

export function savePhoto(id: string, dataUrl: string | null) {
  if (dataUrl) sessionStorage.setItem(key(id), dataUrl);
  else sessionStorage.removeItem(key(id));
  window.dispatchEvent(new Event(EVENT));
}

export function readPhoto(id: string) {
  return sessionStorage.getItem(key(id));
}

/** Applicant photo saved in session storage for this application. */
export function usePhoto(id: string) {
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => setPhoto(readPhoto(id));
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [id]);
  return photo;
}

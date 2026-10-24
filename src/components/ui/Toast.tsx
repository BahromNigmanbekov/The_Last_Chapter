"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type Tone = "info" | "success" | "error";

interface ToastInput {
  title: string;
  description?: string;
  tone?: Tone;
}

interface ToastItem extends ToastInput {
  id: number;
  tone: Tone;
}

interface ToastApi {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      const item: ToastItem = { ...input, id, tone: input.tone ?? "info" };
      setItems((current) => [...current.slice(-2), item]); // keep at most 3 on screen
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" aria-label="Bildirishnomalar">
        {items.map((item) => (
          <div
            key={item.id}
            className={`toast toast--${item.tone}`}
            role={item.tone === "error" ? "alert" : "status"}
          >
            <div className="toast__body">
              <p className="toast__title">{item.title}</p>
              {item.description && <p className="toast__text">{item.description}</p>}
            </div>
            <button type="button" className="toast__close" onClick={() => dismiss(item.id)} aria-label="Yopish">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

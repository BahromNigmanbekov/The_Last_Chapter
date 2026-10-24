"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getBrowserClient } from "@/lib/supabase/browser";
import { MAX_MEMORY_FILE_BYTES, MEMORY_MIME_TYPES } from "@/lib/media";
import { prepareMemoryUpload, submitMemory } from "./actions";

export function MemoryForm({ disabled, mediaType }: { disabled: boolean; mediaType?: "image" | "video" }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [phase, setPhase] = useState("");
  const [key, setKey] = useState(0);
  const [fileName, setFileName] = useState("");
  return <form key={key} id="upload-media" className="admin__form" action={(formData) => startTransition(async () => {
    try {
      const file = fileRef.current?.files?.[0];
      let path = "";
      if (file) {
        if (!MEMORY_MIME_TYPES[file.type] || file.size > MAX_MEMORY_FILE_BYTES || file.size === 0) { toast({ tone: "error", title: "Rasm yoki video tanlang, hajmi 50 MB gacha bo‘lsin." }); return; }
        setPhase("Fayl yuklanmoqda…");
        const prepared = await prepareMemoryUpload({ type: file.type, size: file.size });
        if (!prepared.ok) { toast({ tone: "error", title: prepared.message }); return; }
        const upload = await getBrowserClient().storage.from("memories").uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: file.type });
        if (upload.error) { toast({ tone: "error", title: "Fayl yuklanmadi. Internet aloqasini tekshiring." }); return; }
        path = prepared.path;
      }
      formData.delete("file");
      formData.set("filePath", path);
      setPhase("Saqlanmoqda…");
      const result = await submitMemory(formData);
      if (result.ok) { toast({ tone: "success", title: "Xotira yuborildi", description: "Tashkilotchi tasdiqlagach, boshqalarga ham ko‘rinadi." }); setKey(k => k + 1); setFileName(""); router.refresh(); }
      else toast({ tone: "error", title: "Saqlab bo‘lmadi", description: result.message });
    } catch { toast({ tone: "error", title: "Yuborib bo‘lmadi. Internet aloqasini tekshirib, qayta urinib ko‘ring." }); }
    finally { setPhase(""); }
  })}>
    <div className="field"><label htmlFor="memory-file" className="field__label">{mediaType === "image" ? "Rasm tanlang" : mediaType === "video" ? "Video tanlang" : "Rasm yoki video (ixtiyoriy)"}</label><input ref={fileRef} id="memory-file" name="file" type="file" className="sr-only" accept={mediaType === "image" ? "image/jpeg,image/png,image/webp" : mediaType === "video" ? "video/mp4,video/webm,video/quicktime" : Object.keys(MEMORY_MIME_TYPES).join(",")} disabled={disabled || pending} onChange={event => setFileName(event.target.files?.[0]?.name ?? "")} /><label htmlFor="memory-file" className={`file-picker ${disabled || pending ? "file-picker--disabled" : ""}`}>{mediaType === "image" ? "Rasm tanlash" : mediaType === "video" ? "Video tanlash" : "Rasm yoki video tanlash"}</label><p className="field__msg">{fileName || "JPG, PNG, WebP, MP4, WebM yoki MOV. 50 MB gacha."}</p></div>
    <div className="field"><label className="field__label" htmlFor="memory-caption">Xotirangiz yoki faylga izoh</label><textarea id="memory-caption" name="caption" className="field__input admin__textarea" rows={4} maxLength={500} placeholder="Bu maktabdagi eng qiziqarli kunlardan biri edi…" disabled={disabled || pending} /><p className="field__msg">Matn yozing yoki fayl tanlang. Izoh 500 belgigacha.</p></div>
    {phase && <p role="status" className="notice">{phase}</p>}
    <Button type="submit" loading={pending} disabled={disabled} className="btn--block">Ulashish</Button>
  </form>;
}

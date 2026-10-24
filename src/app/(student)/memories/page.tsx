import Link from "next/link";
import { statusLabel } from "@/lib/labels";
import { requireStudent } from "@/lib/auth-student";
import { getAdminClient } from "@/lib/supabase/admin";
import { getEvent } from "@/lib/event";
import { signMemoryFile } from "@/lib/memory-media";
import { MemoryMedia } from "@/components/MemoryMedia";
import { MemoryForm } from "./MemoryForm";

export const metadata = { title: "Video, rasmlar va xotiralar — THE LAST CHAPTER" };
export const dynamic = "force-dynamic";

export default async function MemoriesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const student = await requireStudent();
  const [event, params] = await Promise.all([getEvent(), searchParams]);
  const mediaType = params.type === "image" || params.type === "video" ? params.type : undefined;
  let query = getAdminClient().from("memories").select("id, student_id, kind, caption, status, file_path").or(`student_id.eq.${student.id},status.eq.approved`).order("created_at", { ascending: false }).limit(100);
  if (mediaType) query = query.eq("kind", mediaType);
  const { data, error } = await query;
  if (error) throw error;
  const memories = await Promise.all((data ?? []).map(async memory => ({ ...memory, mediaUrl: await signMemoryFile(memory.file_path) })));
  const own = memories.filter(memory => memory.student_id === student.id);
  const gallery = memories.filter(memory => memory.status === "approved");
  return <>
    <Link href="/dashboard" className="linkbtn">← Shaxsiy kabinetga qaytish</Link>
    <h1 className="auth__title" style={{ marginTop: 16 }}>{mediaType === "image" ? "Esdalik rasmlarimiz." : mediaType === "video" ? "Unutilmas videolarimiz." : "Xotiralarimiz shu yerda."}</h1>
    <p className="auth__lead">Rasm, video yoki bir necha satr xotira ulashing. Boshqalarga faqat tashkilotchi tasdiqlagan xotiralar ko‘rinadi.</p>
    <nav className="memory-tabs" aria-label="Xotira turi"><Link href="/memories" aria-current={!mediaType ? "page" : undefined}>Barchasi</Link><Link href="/memories?type=image" aria-current={mediaType === "image" ? "page" : undefined}>Rasmlar</Link><Link href="/memories?type=video" aria-current={mediaType === "video" ? "page" : undefined}>Videolar</Link></nav>
    <section className="panel"><h2 className="panel__title">Xotira ulashish</h2>{!event.memoriesOpen && <p className="notice" style={{ marginBlock: 16 }}>Tashkilotchi hozircha yangi xotiralar yuklashni ochmagan. Tasdiqlangan xotiralarni quyida ko‘rishingiz mumkin.</p>}<MemoryForm disabled={!event.memoriesOpen} mediaType={mediaType} /></section>
    <section className="panel"><h2 className="panel__title">Siz ulashgan xotiralar</h2>{own.length === 0 ? <p className="panel__empty">Hali xotira yubormagansiz.</p> : <div className="memory-grid">{own.map(memory => <article className="memory-card" key={memory.id}><MemoryMedia kind={memory.kind} url={memory.mediaUrl} />{memory.caption && <p>{memory.caption}</p>}<span className={`chip ${memory.status === "approved" ? "chip--ok" : ""}`}>{statusLabel(memory.status)}</span></article>)}</div>}</section>
    <section className="panel"><h2 className="panel__title">Birgalikdagi xotiralar</h2>{gallery.length === 0 ? <p className="panel__empty">Tasdiqlangan xotiralar shu yerda paydo bo‘ladi.</p> : <div className="memory-grid">{gallery.map(memory => <article className="memory-card" key={memory.id}><MemoryMedia kind={memory.kind} url={memory.mediaUrl} />{memory.caption && <p>{memory.caption}</p>}<span className="field__msg">{statusLabel(memory.kind)}</span></article>)}</div>}</section>
  </>;
}

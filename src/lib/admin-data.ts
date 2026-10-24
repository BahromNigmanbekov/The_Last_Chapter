import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { firstRelated } from "@/lib/relations";
import { signMemoryFile } from "@/lib/memory-media";

// ---------------------------------------------------------------------------
// Shared row/query shapes for the admin panel. All queries use the service-role
// client (RLS is bypassed on purpose: access is already gated by requireAdmin()).
// ---------------------------------------------------------------------------

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";

export interface StudentOverview {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  registrationCode: string;
  registered: boolean;
  createdAt: string;
  paymentStatus: "not_paid" | PaymentStatus;
  amountPaid: number;
  ticketToken: string | null;
  ticketStatus: "pending" | "valid" | "used" | "revoked" | null;
  entered: boolean;
  enteredAt: string | null;
}

interface StudentRow {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  registration_code: string;
  registered: boolean;
  created_at: string;
  payments: { status: PaymentStatus; amount: number }[] | null;
  tickets: { ticket_token: string; status: "pending" | "valid" | "used" | "revoked" } | { ticket_token: string; status: "pending" | "valid" | "used" | "revoked" }[] | null;
  entries: { entered_at: string }[] | null;
}

function summarizePayments(payments: { status: PaymentStatus; amount: number }[] | null) {
  const list = payments ?? [];
  const paid = list.filter((p) => p.status === "paid");
  if (paid.length > 0) {
    return { status: "paid" as const, amount: paid.reduce((sum, p) => sum + p.amount, 0) };
  }
  if (list.some((p) => p.status === "pending")) return { status: "pending" as const, amount: 0 };
  return { status: "not_paid" as const, amount: 0 };
}

export async function listStudents(): Promise<StudentOverview[]> {
  const { data, error } = await getAdminClient()
    .from("students")
    .select(
      "id, first_name, last_name, class_name, registration_code, registered, created_at, payments(status, amount), tickets(ticket_token, status), entries(entered_at)",
    )
    .order("class_name", { ascending: true })
    .order("last_name", { ascending: true });
  if (error) throw error;

  return (data as unknown as StudentRow[]).map((row) => {
    const { status: paymentStatus, amount: amountPaid } = summarizePayments(row.payments);
    const ticket = firstRelated(row.tickets);
    const entry = row.entries?.[0] ?? null;
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      className: row.class_name,
      registrationCode: row.registration_code,
      registered: row.registered,
      createdAt: row.created_at,
      paymentStatus,
      amountPaid,
      ticketToken: ticket?.ticket_token ?? null,
      ticketStatus: ticket?.status ?? null,
      entered: entry !== null,
      enteredAt: entry?.entered_at ?? null,
    };
  });
}

export interface DashboardStats {
  totalStudents: number;
  registered: number;
  paid: number;
  notPaid: number;
  entered: number;
  totalCollected: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const students = await listStudents();
  return {
    totalStudents: students.length,
    registered: students.filter((s) => s.registered).length,
    paid: students.filter((s) => s.paymentStatus === "paid").length,
    notPaid: students.filter((s) => s.paymentStatus !== "paid").length,
    entered: students.filter((s) => s.entered).length,
    totalCollected: students.reduce((sum, s) => sum + s.amountPaid, 0),
  };
}

export interface MovieWithVotes {
  id: string;
  title: string;
  description: string;
  posterUrl: string | null;
  durationMinutes: number | null;
  isSelected: boolean;
  votes: number;
}

export async function listMoviesWithVotes(): Promise<MovieWithVotes[]> {
  const { data, error } = await getAdminClient()
    .from("movies")
    .select("id, title, description, poster_url, duration_minutes, is_selected, movie_votes(id)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (
    data as unknown as {
      id: string;
      title: string;
      description: string;
      poster_url: string | null;
      duration_minutes: number | null;
      is_selected: boolean;
      movie_votes: { id: string }[] | null;
    }[]
  ).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    posterUrl: row.poster_url,
    durationMinutes: row.duration_minutes,
    isSelected: row.is_selected,
    votes: row.movie_votes?.length ?? 0,
  }));
}

export interface MusicRequestRow {
  id: string;
  artist: string;
  song: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  student: { firstName: string; lastName: string; className: string } | null;
}

export async function listMusicRequests(): Promise<MusicRequestRow[]> {
  const { data, error } = await getAdminClient()
    .from("music_requests")
    .select("id, artist, song, status, created_at, students(first_name, last_name, class_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (
    data as unknown as {
      id: string;
      artist: string;
      song: string;
      status: "pending" | "approved" | "rejected";
      created_at: string;
      students: { first_name: string; last_name: string; class_name: string } | null;
    }[]
  ).map((row) => ({
    id: row.id,
    artist: row.artist,
    song: row.song,
    status: row.status,
    createdAt: row.created_at,
    student: row.students
      ? { firstName: row.students.first_name, lastName: row.students.last_name, className: row.students.class_name }
      : null,
  }));
}

export interface MemoryRow {
  id: string;
  kind: "video" | "image" | "text";
  caption: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  mediaUrl?: string | null;
  student: { firstName: string; lastName: string; className: string } | null;
}

export async function listMemories(): Promise<MemoryRow[]> {
  const { data, error } = await getAdminClient()
    .from("memories")
    .select("id, kind, caption, status, file_path, created_at, students(first_name, last_name, class_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return Promise.all((
    data as unknown as {
      id: string;
      kind: "video" | "image" | "text";
      caption: string | null;
      status: "pending" | "approved" | "rejected";
      file_path: string | null;
      created_at: string;
      students: { first_name: string; last_name: string; class_name: string } | null;
    }[]
  ).map(async (row) => ({
    id: row.id,
    kind: row.kind,
    caption: row.caption,
    mediaUrl: await signMemoryFile(row.file_path),
    status: row.status,
    createdAt: row.created_at,
    student: row.students
      ? { firstName: row.students.first_name, lastName: row.students.last_name, className: row.students.class_name }
      : null,
  })));
}

export interface PaymentRow {
  id: string;
  amount: number;
  status: PaymentStatus;
  provider: string | null;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  student: { firstName: string; lastName: string; className: string } | null;
}

export async function listPayments(): Promise<PaymentRow[]> {
  const { data, error } = await getAdminClient()
    .from("payments")
    .select(
      "id, amount, status, provider, transaction_id, paid_at, created_at, students(first_name, last_name, class_name)",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (
    data as unknown as {
      id: string;
      amount: number;
      status: PaymentStatus;
      provider: string | null;
      transaction_id: string | null;
      paid_at: string | null;
      created_at: string;
      students: { first_name: string; last_name: string; class_name: string } | null;
    }[]
  ).map((row) => ({
    id: row.id,
    amount: row.amount,
    status: row.status,
    provider: row.provider,
    transactionId: row.transaction_id,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    student: row.students
      ? { firstName: row.students.first_name, lastName: row.students.last_name, className: row.students.class_name }
      : null,
  }));
}

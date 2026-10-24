import { listStudents } from "@/lib/admin-data";
import { getEvent } from "@/lib/event";
import { StudentsTable } from "./StudentsTable";
import { AddStudentForm } from "./AddStudentForm";
import { ImportForm } from "./ImportForm";

export const metadata = { title: "O‘quvchilar — Boshqaruvchi" };
export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const [students, event] = await Promise.all([listStudents(), getEvent()]);
  const classes = Array.from(new Set(students.map((s) => s.className))).sort();

  return (
    <>
      <h1 className="admin__title">O‘quvchilar</h1>

      <div className="admin__grid2">
        <AddStudentForm />
        <ImportForm />
      </div>

      <StudentsTable students={students} classes={classes} minContribution={event.minContribution} />
    </>
  );
}

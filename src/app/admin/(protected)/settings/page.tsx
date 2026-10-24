import { getEvent } from "@/lib/event";
import { SettingsForm } from "./SettingsForm";
import { RegistrationToggle } from "./RegistrationToggle";

export const metadata = { title: "Sozlamalar — Boshqaruvchi" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const event = await getEvent();

  return (
    <>
      <h1 className="admin__title">Sozlamalar</h1>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Ro‘yxatdan o‘tish</h2>
          <RegistrationToggle open={event.registrationOpen} />
        </div>
        <p className="panel__hint">
          Avval ro‘yxatdan o‘tgan o‘quvchilar qayta kira oladi. Bu sozlama faqat
          birinchi marta ro‘yxatdan o‘tishni boshqaradi.
        </p>
      </section>

      <section className="panel">
        <h2 className="panel__title">Tadbir tafsilotlari</h2>
        <SettingsForm event={event} />
      </section>
    </>
  );
}

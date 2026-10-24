"use client";

import { OpenToggle } from "../music/OpenToggle";
import { setRegistrationOpen } from "./actions";

export function RegistrationToggle({ open }: { open: boolean }) {
  return (
    <OpenToggle open={open} onToggle={setRegistrationOpen} openLabel="Ro‘yxatdan o‘tish ochiq" closedLabel="Ro‘yxatdan o‘tish yopiq" />
  );
}

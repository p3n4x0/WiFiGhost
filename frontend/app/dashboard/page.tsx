"use client"
import { useState } from "react";
import Scanner from "../ui/components/dashboard/scanner";
import Stepper from "../ui/components/dashboard/stepper";
import Cracker from "../ui/components/dashboard/cracker";

export default function DashboardPage() {
  const [isActivated, setActivated] = useState(0);
  return (
    <main className="flex flex-col gap-6 pt-6">
      <Stepper isActivated={isActivated} />
      <Scanner isActivated={isActivated} setActivated={setActivated} />
      <Cracker setActivated={setActivated} />
    </main>
  );
}

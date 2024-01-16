"use client"
import { useState } from "react";
import Scanner from "../ui/components/dashboard/scanner";
import Stepper from "../ui/components/dashboard/stepper";
import Cracker from "../ui/components/dashboard/cracker";

export default function Home() {
  const [isActivated, setActivated] = useState(0);
  return (
    <main>
      <Scanner isActivated={isActivated} setActivated={setActivated} />
      <Cracker setActivated={setActivated}/>
      <Stepper isActivated={isActivated}/>
    </main>
  );
}


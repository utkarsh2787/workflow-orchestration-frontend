"use client";

import { useState } from "react";
import CreateWorkflowModal from "./CreateWorkflowModal";

export default function DashboardActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setOpen(true)} className="rounded-full bg-gradient-to-r from-[#00ffea] to-[#6a00ff] px-4 py-2 text-black font-semibold">Create new workflow</button>
      {open && <CreateWorkflowModal onClose={() => setOpen(false)} />}
    </div>
  );
}

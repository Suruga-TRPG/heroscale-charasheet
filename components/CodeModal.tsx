"use client";
import { useState } from "react";
import RedeemCodeForm from "./RedeemCodeForm";

export default function CodeModal({trigger}:{trigger:(open:()=>void)=>React.ReactNode}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {trigger(()=>setOpen(true))}
      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="bg-white rounded-2xl p-5 w-[min(92vw,480px)]">
            <div className="flex justify-end mb-2">
              <button onClick={()=>setOpen(false)} aria-label="close">×</button>
            </div>
            <h3 className="text-lg font-semibold mb-2">支援者特典コードを入力</h3>
            <RedeemCodeForm />
          </div>
        </div>
      )}
    </>
  );
}

// /app/create/page.tsx
'use client';

import { Suspense } from "react";
import CreatePageContent from "./CreatePageContent";

export default function CreatePage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <CreatePageContent />
    </Suspense>
  );
}

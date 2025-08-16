// /app/create/page.tsx
'use client';

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CreatePageContent from "./CreatePageContent";

function Inner() {
  const sp = useSearchParams();
  const characterId = sp.get("id") ?? undefined; // 例: /create?id=xxxx

  return <CreatePageContent characterId={characterId} />;
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <Inner />
    </Suspense>
  );
}

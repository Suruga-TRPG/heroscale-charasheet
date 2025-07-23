<<<<<<< HEAD
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
=======
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("ログインに失敗しました");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert("ログアウトに失敗しました");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-100 text-center">
      <h1 className="text-4xl font-bold mb-2">英雄の尺度～Hero Scale～</h1>
      <h2 className="text-xl text-gray-700 mb-6">キャラクターシート保管庫</h2>

      {/* β版注意文 */}
      <p className="text-sm text-red-600 mb-4">
        ※このサイトはβ版です。仕様は予告なく変更される場合があります。
      </p>

      {/* ログイン情報 */}
      {user ? (
        <div className="mb-6 text-sm text-gray-700">
          <p className="mb-2">ログイン中: {user.displayName}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mb-4"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-6"
        >
          Googleでログイン
        </button>
      )}

      <Link
        href="/create"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow mb-4"
      >
        キャラクター作成
      </Link>


      <Link
        href="/mypage"
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow mb-4"
      >
        マイページへ
      </Link>

           {/* 利用規約 折りたたみボックス */}
      <div className="mt-8 w-full max-w-3xl text-left">
        <button
          onClick={() => setShowTerms(!showTerms)}
          className="text-blue-700 underline mb-2"
        >
          {showTerms ? "▲ 利用規約を閉じる" : "▼ 利用規約を表示"}
        </button>

        {showTerms && (
          <div className="border rounded p-4 max-h-96 overflow-y-scroll bg-white text-sm whitespace-pre-wrap leading-relaxed shadow">
{`英雄の尺度キャラクターシート保管庫 利用規約（β版）

第1条（適用）
1. 本規約は、本サービスの提供条件および利用に関する一切の関係に適用されます。
2. 利用者は本規約に同意した上で、本サービスを利用するものとします。

第2条（サービス概要）
1. 本サービスは、TRPG「英雄の尺度」におけるキャラクターシートの作成・保存・共有を目的としたWebサービスです。
2. 本サービスはβ版として公開されており、予告なく仕様の変更、データの削除、提供の中断・終了が行われる場合があります。

第3条（著作権および投稿データ）
1. 利用者が本サービスに投稿または保存したキャラクター情報やメモ等のデータは、当該利用者に著作権が帰属します。
2. 利用者は、他者の著作権・肖像権・プライバシー権を侵害するデータを投稿してはなりません。
3. 管理者は、運営上必要と判断した場合、データの削除・非公開化を行うことがあります。

第4条（禁止事項）
以下の行為を禁止します：
- 法令に違反する行為
- 他人への誹謗中傷、差別的・暴力的・性的表現の投稿
- 他人になりすます行為
- 本サービスの運営を妨げる行為
- 営利目的での不正使用
- キャラクターシートの自動収集・解析などの不正アクセス行為

第5条（免責事項）
1. 本サービスは無保証で提供されます。
2. サーバ障害・仕様変更等によりデータが削除される可能性があることを、利用者はあらかじめ了承するものとします。
3. 本サービスの利用によって生じた損害について、運営者は一切の責任を負いません。

第6条（利用規約の変更）
1. 本規約は、運営者の判断により随時変更されることがあります。
2. 変更後の規約は、サービス上に表示された時点で効力を持ちます。

第7条（準拠法と管轄）
本規約は日本法を準拠法とし、本サービスに関連する一切の紛争は、運営者の指定する日本国内の裁判所を第一審の専属的合意管轄裁判所とします。

第8条（Googleログインおよび個人情報の取扱い）
1. 本サービスでは、Googleアカウントを利用したログイン機能（Firebase Authentication）を提供しています。
2. ログイン時には、Googleアカウントの「ユーザーID」と「表示名」のみを取得します。これらはキャラクターシートの保存・参照に使用されます。
3. 取得した情報は、利用者本人の識別と機能提供のためにのみ使用され、外部へ提供することはありません。
4. Firebaseのプライバシーポリシー（https://firebase.google.com/support/privacy）にも準拠します。
`}
          </div>
        )}
    </div>

    </main>
>>>>>>> 5b62b47 (最新のアプリを追加)
  );
}

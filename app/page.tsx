"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

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

      <p className="text-sm text-red-600 mb-4">
        ※Googleログインをしないとキャラクターシートの保存はできません
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
{`英雄の尺度キャラクターシート保管庫 利用規約

第1条（適用）
1. 本規約は、本サービスの提供条件および利用に関する一切の関係に適用されます。
2. 利用者は本規約に同意した上で、本サービスを利用するものとします。

第2条（サービス概要）
1. 本サービスは、TRPG「英雄の尺度」におけるキャラクターシートの作成・保存・共有を目的としたWebサービスです。
2. 本サービスは予告なく仕様の変更、データの削除、提供の中断・終了が行われる場合があります。

第3条（著作権および投稿データ）
1. 利用者が本サービスに投稿または保存したキャラクター情報やメモ等のデータは、当該利用者に著作権が帰属します。
2. 利用者は、他者の著作権・肖像権・プライバシー権を侵害するデータを投稿してはなりません。
3. 管理者は、運営上必要と判断した場合、データの削除・非公開化を行うことがあります。
4. 利用者がアップロードする画像等のファイルは、利用者自身が著作権を保有するもの、または著作権者の許諾を得たフリー素材・商用利用可能素材等に限ります。
5. 利用者が著作権違反素材をアップロードしたことにより発生した一切のトラブル・損害・紛争については、当該利用者が責任を負うものとし、運営者は一切の責任を負いません。
6. 本サービス上では、アップロードされた画像に対してウォーターマーク・解像度制限などの加工を施し表示する場合があります。
7. アップロードされた画像が著作権違反素材であるとの申し立てを受けた場合、運営者は当該画像の確認を行い、必要に応じて速やかに削除その他の対応を行います。
8. 本サービスのソースコードおよびデザイン・構成要素等に関する著作権は、運営者に帰属します。

第4条（禁止事項）
以下の行為を禁止します：
- 法令に違反する行為
- 他者の著作権・肖像権・プライバシー権を侵害する画像等のアップロード
- 他人への誹謗中傷、差別的・暴力的・性的表現の投稿
- 他人になりすます行為
- キャラクターシートの自動収集・解析などの不正アクセス行為
- 本サービスのソースコードを無断で複製、改変、または再配布する行為（個人の学習目的での閲覧・一時的改変を除く）
- 本サービスの運営を妨げる行為
- 営利目的での不正使用


【上記の禁止行為に違反した場合、運営者は予告なく当該アカウントの停止・削除、または当該データの削除・非公開化などの措置を行うことができるものとします。】


第5条（免責事項）
1. 本サービスは無保証で提供されます。
2. サーバ障害・仕様変更等によりデータが削除される可能性があることを、利用者はあらかじめ了承するものとします。
3. 本サービスの利用によって生じた損害について、運営者は一切の責任を負いません。

第6条（利用規約の変更）
1. 本規約は、運営者の判断により随時変更されることがあります。
2. 変更後の規約は、サービス上に表示された時点で効力を持ちます。

第7条（準拠法と管轄）
本規約は日本法を準拠法とし、本サービスに関連する一切の紛争は、運営者の指定する日本国内の裁判所を第一審の専属的合意管轄裁判所とします。
`}
          </div>
        )}
    </div>

          {/* プライバシーポリシー 折りたたみボックス */}
      <div className="mt-8 w-full max-w-3xl text-left">
        <button
          onClick={() => setShowPrivacy(!showPrivacy)}
          className="text-blue-700 underline mb-2"
        >
          {showPrivacy ? "▲ プライバシーポリシーを閉じる" : "▼ プライバシーポリシーを表示"}
        </button>

        {showPrivacy && (
          <div className="border rounded p-4 max-h-96 overflow-y-scroll bg-white text-sm whitespace-pre-wrap leading-relaxed shadow">
{`プライバシーポリシー

「英雄の尺度キャラクターシート保管庫」（以下、「本サービス」）では、利用者のプライバシーを尊重し、個人情報の保護に最大限の注意を払っています。以下に、本サービスにおける個人情報の取扱いについて定めます。

第1条（取得する情報）
本サービスは、以下の情報を取得します：
- Googleアカウントの「ユーザーID」
- Googleアカウントの「表示名」
これらは、Firebase Authenticationを用いたログイン時に自動的に取得されます。

第2条（利用目的）
取得した情報は、以下の目的に限り使用します：
- 利用者の識別および認証
- キャラクターシートの保存・管理・閲覧機能の提供
- サービスの円滑な運営および保守管理

第3条（情報の管理）
取得した情報は、Googleが提供するFirebaseプラットフォーム上で安全に管理され、以下のような対策により保護されます：
- 通信の暗号化（HTTPS）
- Firebase Authenticationによる認証管理
- 管理者のアクセス制限

第4条（第三者提供）
本サービスは、以下の場合を除き、取得した情報を第三者に提供することはありません：
1. 利用者本人の同意がある場合
2. 法令に基づき開示が必要な場合

第5条（外部サービスの利用）
本サービスは、Googleが提供するFirebaseを利用しています。Firebaseにおける個人情報の取り扱いについては、以下のプライバシーポリシーを参照してください：
https://firebase.google.com/support/privacy

第6条（情報の削除・開示請求）
利用者が自身の情報の削除・開示などを希望する場合は、下記のお問い合わせフォームよりご連絡ください。本人確認の上、適切に対応いたします。
お問い合わせフォーム：https://docs.google.com/forms/d/e/1FAIpQLSfx9zhLI9ymFnSTGEpIPavCZYnltL0uM5BrXozMnXEAYfzOsg/viewform?usp=header

第7条（改訂）
本ポリシーの内容は、法令の改正やサービス内容の変更に応じて、予告なく改訂されることがあります。重要な変更がある場合は、サービス上でお知らせいたします。

第8条（お問い合わせ）
プライバシーポリシーに関するご質問・ご意見がある場合は、以下のフォームよりご連絡ください：
お問い合わせフォーム：https://docs.google.com/forms/d/e/1FAIpQLSfx9zhLI9ymFnSTGEpIPavCZYnltL0uM5BrXozMnXEAYfzOsg/viewform?usp=header

施行日：2025年7月24日`}
          </div>
        )}

<div className="bg-grey-100 text-black py-10 px-4">
  <h2 className="text-center text-2xl font-bold mb-6">各種リンク</h2>
  <div className="flex flex-col md:flex-row justify-center items-center gap-6 max-w-4xl mx-auto">
    
    {/* Xボタン */}
    <Link href="https://x.com/Hero_Scale_CS" target="_blank" className="w-60">
      <div className="bg-black text-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col items-center">
        <img src="/x-logo.png" alt="X" className="w-16 h-16 object-contain mb-2" />
        <h3 className="font-semibold text-lg mb-1">X</h3>
        <p className="text-sm text-center">
          アップデート内容やお問合せはこちらからも可能です。
        </p>
      </div>
    </Link>

    {/* FANBOX */}
    <Link href="https://suruga-trpg.fanbox.cc/" target="_blank" className="w-60">
      <div className="bg-white text-black rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col items-center">
        <img src="/fanbox-logo.png" alt="FANBOX" className="w-16 h-16 object-contain mb-2" />
        <h3 className="font-semibold text-lg mb-1">開発支援（FANBOX）</h3>
        <p className="text-sm text-center">
          開発・維持管理の支援をしていただける方を募集しています。
        </p>
      </div>
    </Link>

    {/* お問い合わせ */}
    <Link
      href="https://docs.google.com/forms/d/e/1FAIpQLSfx9zhLI9ymFnSTGEpIPavCZYnltL0uM5BrXozMnXEAYfzOsg/viewform?usp=header"
      target="_blank"
      className="w-60"
    >
      <div className="bg-white text-black rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col items-center">
        <img src="/contact-icon.png" alt="お問い合わせ" className="w-16 h-16 object-contain mb-2" />
        <h3 className="font-semibold text-lg mb-1">お問い合わせ</h3>
        <p className="text-sm text-center">
          不具合・ご要望などはこちらからお送りください。
        </p>
      </div>
    </Link>

    <div className="fixed bottom-2 right-2 text-xs text-gray-500 pointer-events-none z-50">
      ver.1.1.0 （2025/07/26 正式公開）
    </div>

  </div>
</div>
      </div>
    </main>
  );
}

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const db = admin.firestore();

/** 特典コードを検証して支援者権限を付与（当月末まで） */
export const redeemFanboxCode = functions.https.onCall(async (request) => {
  // v4: request.auth / request.data を使う
  if (!request.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }
  const { code } = (request.data || {}) as { code?: string };
  if (typeof code !== "string" || code.length < 10) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid code");
  }

  const snap = await db.doc("fanboxCodes/current").get();
  if (!snap.exists) {
    throw new functions.https.HttpsError("failed-precondition", "Code not set");
  }
  const cfg = snap.data()!;

  const now = Date.now();
  const exp = Date.parse(cfg.expiresAtISO);
  const valid = cfg.active === true && now <= exp && cfg.code === code;

  if (!valid) {
    throw new functions.https.HttpsError("permission-denied", "Code mismatch or expired");
  }

  const uid = request.auth.uid;

  await db.doc(`users/${uid}`).set(
    {
      entitlements: {
        supporter: true,
        supporterSource: "FANBOX",
        supporterExpiresAtISO: cfg.expiresAtISO,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    },
    { merge: true }
  );

  await db.doc(`fanboxRedeems/${uid}`).set(
    {
      uid,
      code,
      monthToken: cfg.monthToken,
      redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { ok: true, expiresAtISO: cfg.expiresAtISO };
});

export const grantAdmin = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const email = request.auth.token.email as string | undefined;
  const ALLOW_EMAIL = "shutosurugasoshi@gmail.com"; // ★ここをあなたのAuthメールに

  if (!email || email.toLowerCase() !== ALLOW_EMAIL.toLowerCase()) {
    throw new functions.https.HttpsError("permission-denied", "not allowed");
  }

  await admin.auth().setCustomUserClaims(request.auth.uid, { admin: true });
  return { ok: true };
});

/** 支援者判定（期限内） */
function isSupporter(ent: any): boolean {
  if (!ent?.supporter || !ent?.supporterExpiresAtISO) return false;
  return Date.now() <= Date.parse(ent.supporterExpiresAtISO);
}

/** 通常ユーザーの上限（rootId 系列ごと 2回） */
const PER_ROOT_LIMIT = 2;

/** キャラクター複製API
 * data: { characterId: string, newName?: string }
 * return: { ok: true, newId: string, used: number, limit: number, remaining: number }
 */
export const duplicateCharacter = functions.https.onCall(async (request) => {
  if (!request.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const uid = request.auth.uid;
  const { characterId, newName } = (request.data || {}) as { characterId?: string; newName?: string };
  if (!characterId) throw new functions.https.HttpsError("invalid-argument", "characterId is required");

  // 元シート
  const srcRef = db.doc(`characters/${characterId}`);
  const srcSnap = await srcRef.get();
  if (!srcSnap.exists) throw new functions.https.HttpsError("not-found", "Character not found");
  const src = srcSnap.data() as any;

  // rootId：元は自分のID、コピーは親のrootIdを継承
  const rootId = src.rootId ?? srcRef.id;

  // 支援者状態
  const userSnap = await db.doc(`users/${uid}`).get();
  const ent = userSnap.exists ? (userSnap.data() as any).entitlements : undefined;
  const supporter = isSupporter(ent);

  // 新規ドキュメント参照
  const newRef = db.collection("characters").doc();
  const baseName: string = (src?.name ?? "Untitled") as string;
  const copyName = (newName && String(newName).trim()) || `${baseName} - copy`;

  // 個別ユーザー×rootId のカウンタ
  const counterRef = db.doc(`users/${uid}/dupCounters/${rootId}`);

  await db.runTransaction(async (tx) => {
    if (!supporter) {
      const cntSnap = await tx.get(counterRef);
      const used = cntSnap.exists ? Number((cntSnap.data() as any).used || 0) : 0;
      if (used >= PER_ROOT_LIMIT) {
        throw new functions.https.HttpsError("resource-exhausted", `limit ${PER_ROOT_LIMIT} reached`);
      }
      tx.set(
        counterRef,
        {
          used: used + 1,
          limit: PER_ROOT_LIMIT,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    // 複製作成（所有者は自分に、rootId を継承）
    const { userId: _omit, rootId: _omit2, ...rest } = src;
    tx.set(newRef, {
      ...rest,
      name: copyName,
      userId: uid,
      rootId,
      copiedFrom: srcRef.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  // 返却用：最新の残数
  let used = 0, remaining = -1, limit = -1;
  if (!supporter) {
    const cnt = await counterRef.get();
    used = cnt.exists ? Number((cnt.data() as any).used || 0) : 0;
    limit = PER_ROOT_LIMIT;
    remaining = Math.max(0, limit - used);
  }

  return { ok: true, newId: newRef.id, used, limit: supporter ? -1 : limit, remaining };
});

/** 残回数を取得（バッジ用）
 * data: { characterId: string }
 * return: { supporter: boolean, used: number, limit: number, remaining: number }
 */
export const getDuplicateQuota = functions.https.onCall(async (request) => {
  if (!request.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  const uid = request.auth.uid;
  const { characterId } = (request.data || {}) as { characterId?: string };
  if (!characterId) throw new functions.https.HttpsError("invalid-argument", "characterId is required");

  const snap = await db.doc(`characters/${characterId}`).get();
  if (!snap.exists) throw new functions.https.HttpsError("not-found", "Character not found");
  const src = snap.data() as any;
  const rootId = src.rootId ?? snap.id;

  const userSnap = await db.doc(`users/${uid}`).get();
  const ent = userSnap.exists ? (userSnap.data() as any).entitlements : undefined;
  const supporter = isSupporter(ent);

  if (supporter) return { supporter: true, used: 0, limit: -1, remaining: -1 };

  const cntSnap = await db.doc(`users/${uid}/dupCounters/${rootId}`).get();
  const used = cntSnap.exists ? Number((cntSnap.data() as any).used || 0) : 0;
  const limit = PER_ROOT_LIMIT;
  const remaining = Math.max(0, limit - used);
  return { supporter: false, used, limit, remaining };
});
export const adminResetDupCounter = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }
  // カスタムクレーム admin 必須（grantAdmin 済みのユーザーのみ）
  if ((request.auth.token as any).admin !== true) {
    throw new functions.https.HttpsError("permission-denied", "admin only");
  }

  const { uid, rootId } = (request.data || {}) as { uid?: string; rootId?: string };
  if (!uid || !rootId) {
    throw new functions.https.HttpsError("invalid-argument", "uid and rootId required");
  }

  await db.doc(`users/${uid}/dupCounters/${rootId}`).delete();
  return { ok: true };
});
/** 管理者のみ：特定ユーザー×rootId の複製カウンタを取得 */
export const adminGetDupCounter = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }
  if ((request.auth.token as any).admin !== true) {
    throw new functions.https.HttpsError("permission-denied", "admin only");
  }

  const { uid, rootId } = (request.data || {}) as { uid?: string; rootId?: string };
  if (!uid || !rootId) {
    throw new functions.https.HttpsError("invalid-argument", "uid and rootId required");
  }

  const snap = await db.doc(`users/${uid}/dupCounters/${rootId}`).get();
  const used = snap.exists ? Number((snap.data() as any).used ?? 0) : 0;
  // limit はドキュメントが無い場合でも 2 として扱う（仕様に合わせる）
  const limit = snap.exists ? Number((snap.data() as any).limit ?? 2) : 2;
  const remaining = limit < 0 ? -1 : Math.max(0, limit - used);

  return { ok: true, exists: snap.exists, used, limit, remaining };
});

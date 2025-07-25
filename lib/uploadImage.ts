// lib/uploadImage.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase"; // すでに firebase.ts で定義済みのものを利用

const storage = getStorage(app);

export async function uploadImageFile(file: File, userId: string, fileName: string): Promise<string> {
  const storageRef = ref(storage, `images/${userId}/${fileName}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

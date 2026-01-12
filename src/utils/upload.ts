import { storage } from "@/lib/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import imageCompression from "browser-image-compression";

export const uploadToFirebase = async (
  file: File,
  folder: string = "uploads"
) => {
  if (!storage) return null;

  try {
    let fileToUpload: Blob | File = file;

    // ✅ IMAGE COMPRESSION
    if (file.type.startsWith("image/")) {
      try {
        fileToUpload = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      } catch (err) {
        console.warn("Image compression failed:", err);
      }
    }

    // ✅ VIDEO SIZE CHECK
    if (file.type.startsWith("video/")) {
      const sizeMB = file.size / (1024 * 1024);
      console.log("Video size:", sizeMB.toFixed(2), "MB");

      if (sizeMB > 20) {
        throw new Error("Video too large. Max 20MB allowed.");
      }
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(storage, `${folder}/${filename}`);

    // ✅ RESUMABLE UPLOAD (IMPORTANT)
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

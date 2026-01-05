import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";

export const uploadToFirebase = async (file: File, folder: string = "uploads") => {
  if (!storage) return null;

  try {
    let fileToUpload = file;

    // COMPRESS IMAGES
    // If it's an image, compress it to max 0.5MB (good for web)
    if (file.type.startsWith("image/")) {
      const options = {
        maxSizeMB: 0.5, 
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        fileToUpload = await imageCompression(file, options);
      } catch (error) {
        console.warn("Compression failed, using original:", error);
      }
    }

    // LIMIT VIDEO SIZE (20MB Limit)
    if (file.type.startsWith("video/") && file.size > 20 * 1024 * 1024) {
       throw new Error("Video too large. Max size is 20MB.");
    }

    // UPLOAD
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(storage, `${folder}/${filename}`);
    
    const snapshot = await uploadBytes(storageRef, fileToUpload);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};
"use client";

import React, { CSSProperties, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/ui/modal";

import ShareModal from "./ShareModal";
import { uploadToFirebase } from "@/utils/upload";
import { getRelativeTime } from "@/utils/dateUtils";


import {
  MoreHorizontal,
  Bookmark,
  Check,
  MessageCircle,
  Heart,
  Send,
  Loader2,
  Video,
  Image as ImageIcon,
  Share,
  Copy,
  X,
  Globe,
  Users,
  ChevronDown,
  UploadCloud,
  Flag,
  UserPlus,
  UserMinus,
  Trash2,
  Clock, // Added for Pending status
  Camera,
  StopCircle,
  RefreshCw
} from "lucide-react";

// --- Utilities ---
const truncateStyle: CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

// --- Styles ---
const styles: Record<string, CSSProperties> = {
  createPostTopRow: {
    display: "flex",
    gap: "12px",
    width: "100%",
  },

  mediaRowCompact: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },

  mediaBtnIconOnly: {
    padding: "8px",
    gap: "0",
  },
  createPostCard: {
    backgroundColor: "transparent",
    border: "none",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    padding: "6px 0 10px 0",
    width: "100%",
    textAlign: "left",
    boxShadow: "none",
  },
  inputArea: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
  },
  fakeInput: {
    flex: 1,
    height: "48px",
    borderRadius: "24px",
    border: "1px solid #d1d5db",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: "500",
    width: "100%",
    cursor: "pointer",
    transition: "background 0.2s",
    backgroundColor: "#ffffff",
  },
  mediaRow: {
    display: "flex",
    justifyContent: "space-evenly",
  },
  mediaBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    background: "none",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    color: "#525252",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "background-color 0.2s",
    whiteSpace: "nowrap",
  },
  // 🟢 KEPT EXACTLY AS REQUESTED (8px padding, no radius change)
  postCard: {
    backgroundColor: "transparent",
    border: "none",
    padding: "8px 8px 8px 2px",
    width: "100%",
    textAlign: "left",
    position: "relative",
  },
  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    // paddingBottom: "8px",
    marginBottom: "6px",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    position: "relative",
  },
  menuDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    padding: "8px",
    zIndex: 50,
    minWidth: "180px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#334155",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.2s",
  },
  menuBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 40,
    background: "transparent",
    cursor: "default",
  },
  postMeta: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "12px",
    flex: 1,
    minWidth: 0,
    textAlign: "left",
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // borderTop: "1px solid gray",
    paddingTop: "5px",
    marginTop: "12px",
  },
  commentSection: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  commentItem: { display: "flex", gap: "10px", alignItems: "flex-start" },
  commentBubble: {
    backgroundColor: "#f8fafc",
    padding: "8px 12px",
    borderRadius: "12px",
    borderTopLeftRadius: "2px",
    flex: 1,
  },
  commentUser: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "2px",
  },
  commentText: { fontSize: "12px", color: "#475569", lineHeight: "1.4" },
  widgetCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    padding: "16px",
    textAlign: "left",
  },
  widgetHeader: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "700",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
    marginBottom: "12px",
  },
  connectBtnSmall: {
    backgroundColor: "#f1f5f9",
    color: "#2563eb",
    border: "1px solid #e2e8f0",
    padding: "6px 12px",
    borderRadius: "9999px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  connectBtnSent: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    border: "1px solid #bfdbfe",
    cursor: "default",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    overflowX: "hidden",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "600px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
    maxHeight: "90vh",
  },
  modalHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: { fontSize: "18px", fontWeight: "700", color: "#1f2937" },
  modalCloseBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px",
  },
  modalBody: {
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minHeight: "350px",
  },
  modalTextarea: {
    width: "100%",
    minHeight: "120px",
    border: "none",
    outline: "none",
    fontSize: "16px",
    color: "#374151",
    resize: "none",
    fontFamily: "inherit",
  },
  modalFooter: {
    padding: "16px 20px",
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postButton: {
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "8px 24px",
    borderRadius: "9999px",
    fontWeight: "600",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  previewArea: {
    position: "relative",
    width: "100%",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    marginTop: "10px",
  },
  removeMediaBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    padding: "4px",
    cursor: "pointer",
    zIndex: 50,
  },
  storyUploadBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: "12px",
    color: "#000000",
    gap: "16px",
    minHeight: "250px",
    cursor: "pointer",
    border: "1px dashed #4b5563",
  },
  storyUploadIcon: { marginBottom: "8px", opacity: 0.8 },
  browseButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
    marginTop: "10px",
  },
  visibilityBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "9999px",
    border: "1px solid #6b7280",
    fontSize: "10px",
    fontWeight: "600",
    color: "#6b7280",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  visibilityDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: "6px",
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
    padding: "4px",
    zIndex: 70,
    width: "150px",
    display: "flex",
    flexDirection: "column",
  },
  visibilityItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "8px 10px",
    fontSize: "10px",
    fontWeight: "500",
    color: "#374151",
    background: "transparent",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "left",
  },
  visibilityItemContent: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
  },
  visibilityDesc: { fontSize: "11px", color: "#6b7280", marginLeft: "28px" },
};



interface CameraCaptureProps {
  onCapture: (file: File, type: "image" | "video") => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 1. Initialize Camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }, // 'user' = selfie, 'environment' = back
          audio: mode === "video", // Only ask for audio if in video mode
        });

        streamRef.current = currentStream;

        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }

      } catch (err) {
        setError("Camera access denied or unavailable.");
        console.error(err);
      }
    };

    startCamera();

    // Cleanup on unmount
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode]);

  // 2. Take Photo
  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Create a canvas to draw the frame
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontally if it's selfie mode (optional, mirrors feel more natural)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
      onCapture(file, "image");
    }, "image/jpeg", 0.9);
  };

  // 3. Record Video
  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const file = new File([blob], `video_${Date.now()}.webm`, { type: "video/webm" });
      onCapture(file, "video");
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (error) {
    return (
      <div className="relative flex flex-col items-center justify-center h-64 bg-black text-white rounded-lg p-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center 
                   bg-gray-700 hover:bg-gray-600 
                   rounded-full text-white font-bold transition"
          aria-label="Close"
        >
          X
        </button>
        <p className="mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // Muted in preview to prevent feedback loop
        className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
      />

      {/* Overlay Controls */}
      <div className="absolute bottom-0 inset-x-0 pb-8 pt-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center gap-6">

        {/* Mode Switcher */}
        {!isRecording && (
          <div className="flex bg-black/50 backdrop-blur-md rounded-sm p-1.5 gap-2 border border-white/10">
            <button
              onClick={() => setMode("photo")}
              className={`px-6 py-2 text-sm font-semibold rounded-sm transition-all duration-200 ${mode === "photo"
                ? "bg-white text-black shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
            >
              Photo
            </button>
            <button
              onClick={() => setMode("video")}
              className={`px-6 py-2 text-sm font-semibold rounded-sm transition-all duration-200 ${mode === "video"
                ? "bg-white text-black shadow-md"
                : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
            >
              Video
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-8">
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
            <X size={20} />
          </button>

          {mode === "photo" ? (
            <button
              onClick={takePhoto}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white transition-all active:scale-95"
            />
          ) : (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${isRecording ? "border-red-500 bg-red-500" : "border-white bg-transparent"}`}
            >
              {isRecording && <div className="w-6 h-6 bg-white rounded-sm" />}
            </button>
          )}

          {/* Placeholder for symmetry or toggle camera */}
          <div className="w-9" />
        </div>
      </div>
    </div>
  );
};



const VisibilitySelector = ({
  visibility,
  setVisibility,
}: {
  visibility: "public" | "connections";
  setVisibility: (v: "public" | "connections") => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div style={{ position: "relative", width: "200px" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={styles.visibilityBtn}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = "#374151";
          e.currentTarget.style.backgroundColor = "#f9fafb";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = "#6b7280";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {visibility === "public" ? <Globe size={14} /> : <Users size={14} />}
        <span>{visibility === "public" ? "Anyone" : "Connections only"}</span>
        <ChevronDown size={12} />
      </button>
      {showMenu && (
        <div style={styles.visibilityDropdown}>
          <button
            onClick={() => {
              setVisibility("public");
              setShowMenu(false);
            }}
            style={styles.visibilityItem}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <Globe size={14} /> Anyone
          </button>
          <button
            onClick={() => {
              setVisibility("connections");
              setShowMenu(false);
            }}
            style={styles.visibilityItem}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <Users size={14} /> Connections only
          </button>
        </div>
      )}
    </div>
  );
};

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  initialMediaType?: "image" | "video" | null;
}

const CreatePostModal = ({
  isOpen,
  onClose,
  currentUser,
  initialMediaType,
}: CreatePostModalProps) => {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "connections">(
    "public"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    if (isOpen && initialMediaType && fileInputRef.current) {
      setMediaType(initialMediaType);
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  }, [isOpen, initialMediaType]);

  const handleCameraCapture = (file: File, type: "image" | "video") => {
    setMediaFile(file);
    setMediaType(type);

    // Create preview URL locally
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsCameraOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!content.trim() && !mediaFile) return;
    setLoading(true);

    try {
      let uploadedUrl = undefined;
      if (mediaFile) {
        const folder = mediaType === "video" ? "posts/videos" : "posts/images";
        uploadedUrl = await uploadToFirebase(mediaFile, folder);
        if (!uploadedUrl) throw new Error("Upload failed");
      }
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl: uploadedUrl, visibility }),
      });
      if (res.ok) {
        toast.success("Posted successfully!");
        window.location.reload();
        onClose();
      } else {
        throw new Error("Failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to post.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create a post</h2>
          <button onClick={onClose} style={styles.modalCloseBtn}>
            <X size={24} />
          </button>
        </div>
        <div style={styles.modalBody}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                position: "relative",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "#e2e8f0",
              }}
            >
              {currentUser?.profileImage ? (
                <Image
                  src={currentUser.profileImage}
                  alt="Me"
                  fill
                  unoptimized
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getInitials(currentUser?.fullName || "Me")}
                </div>
              )}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              <span style={{ fontWeight: "700", fontSize: "14px" }}>
                {currentUser?.fullName || "User"}
              </span>
              <VisibilitySelector
                visibility={visibility}
                setVisibility={setVisibility}
              />
            </div>
          </div>
          {isCameraOpen ? (
            <CameraCapture
              onCapture={handleCameraCapture}
              onClose={() => setIsCameraOpen(false)}
            />
          ) : (
            <>
              <textarea
                style={styles.modalTextarea}
                placeholder="What do you want to talk about?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              {mediaPreview && (
                /* ... Existing Preview Logic ... */
                <div style={styles.previewArea}>
                  <button onClick={removeMedia} style={styles.removeMediaBtn}><X size={16} /></button>
                  {mediaType === "video" ? (
                    <video src={mediaPreview} controls playsInline preload="metadata" style={{ width: "100%", maxHeight: "300px", WebkitTransform: "translate3d(0, 0, 0)" }} />
                  ) : (
                    <img src={mediaPreview} alt="Preview" style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }} />
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div style={styles.modalFooter}>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ ...styles.mediaBtn, padding: "8px" }}
              title="Add Media"
            >
              <ImageIcon size={20} className="text-blue-500" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ ...styles.mediaBtn, padding: "8px" }}
              title="Add Video"
            >
              <Video size={20} className="text-green-600" />
            </button>

            <button
              onClick={() => setIsCameraOpen(true)}
              style={{ ...styles.mediaBtn, padding: "8px" }}
              title="Use Camera"
              disabled={isCameraOpen} // Disable if already open
            >
              <Camera size={20} className="text-purple-600" />
            </button>

            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept={mediaType === "video" ? "video/*" : "image/*,video/*"} onChange={handleFileChange} />
          </div>
          <button
            onClick={handlePost}
            disabled={loading || (!content.trim() && !mediaFile)}
            style={{
              ...styles.postButton,
              opacity: !content.trim() && !mediaFile ? 0.5 : 1,
              cursor: !content.trim() && !mediaFile ? "not-allowed" : "pointer",
            }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />} Post
          </button>
        </div>
      </div>
    </div>
  );
};

export const CreateStoryModal = ({
  isOpen,
  onClose,
  currentUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}) => {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "connections">(
    "public"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleCameraCapture = (file: File, type: "image" | "video") => {
    setMediaFile(file);
    setMediaType(type);

    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsCameraOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🟢 File Size Check (e.g., 100MB limit for videos)
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      toast.error("File is too large. Please select a file under 100MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setMediaFile(file);
    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };
  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateStory = async () => {
    if (!content.trim() && !mediaFile) return;
    setLoading(true);
    try {
      let uploadedUrl = undefined;
      if (mediaFile) {
        const folder = mediaType === "video" ? "stories/videos" : "stories/images";
        uploadedUrl = await uploadToFirebase(mediaFile, folder);
        if (!uploadedUrl) throw new Error("Upload failed");
      }

      // 🟢 CHANGE 1: Use the correct endpoint (/api/stories)
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🟢 CHANGE 2: Structure body to match your stories/route.ts POST expectation
        body: JSON.stringify({
          content: content, // Matches the 'content' field in Prisma
          imageUrl: mediaType === 'image' ? uploadedUrl : null,
          videoUrl: mediaType === 'video' ? uploadedUrl : null,
          visibility: visibility,
        }),
      });

      if (res.ok) {
        toast.success("Story created!");
        window.location.reload();
        onClose();
      } else {
        throw new Error("Failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to create story.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create a story</h2>
          <button onClick={onClose} style={styles.modalCloseBtn}>
            <X size={24} />
          </button>
        </div>
        <div style={styles.modalBody}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "#e2e8f0",
              }}
            >
              {currentUser?.profileImage ? (
                <Image
                  src={currentUser.profileImage}
                  alt="Me"
                  fill
                  unoptimized
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getInitials(currentUser?.fullName || "Me")}
                </div>
              )}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              <span style={{ fontWeight: "700", fontSize: "14px" }}>
                {currentUser?.fullName || "User"}
              </span>
              <VisibilitySelector
                visibility={visibility}
                setVisibility={setVisibility}
              />
            </div>
          </div>
          {isCameraOpen ? (
            <CameraCapture
              onCapture={handleCameraCapture}
              onClose={() => setIsCameraOpen(false)}
            />
          ) : (
            <>
              <textarea
                style={{ ...styles.modalTextarea, minHeight: "80px", fontSize: "18px", textAlign: "left" }}
                placeholder="Type something..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {mediaPreview && (
                /* ... Existing Preview Logic ... */
                <div style={styles.previewArea}>
                  <button onClick={removeMedia} style={styles.removeMediaBtn}><X size={16} /></button>
                  {mediaType === "video" ? (
                    <video src={mediaPreview} controls playsInline preload="metadata" style={{ width: "100%", maxHeight: "300px", WebkitTransform: "translate3d(0, 0, 0)" }} />
                  ) : (
                    <img src={mediaPreview} alt="Preview" style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }} />
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div style={styles.modalFooter}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ ...styles.mediaBtn, padding: "8px" }}
            >
              <ImageIcon size={20} className="text-blue-500" /> Gallery
            </button>

            {/* 🟢 NEW CAMERA BUTTON */}
            <button
              onClick={() => setIsCameraOpen(true)}
              style={{ ...styles.mediaBtn, padding: "8px" }}
            >
              <Camera size={20} className="text-purple-600" /> Camera
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          <button
            onClick={handleCreateStory}
            disabled={loading || (!content.trim() && !mediaFile)}
            style={{
              ...styles.postButton,
              opacity: !content.trim() && !mediaFile ? 0.5 : 1,
            }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />} Share
            Story
          </button>
        </div>
      </div>
    </div>
  );
};

export const CreatePostWidget = ({ currentUser }: { currentUser?: any }) => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postInitialType, setPostInitialType] = useState<
    "image" | "video" | null
  >(null);

  const [screenType, setScreenType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setScreenType("mobile");
      else if (w < 800) setScreenType("tablet");
      else setScreenType("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (screenType === "mobile") {
      document.body.style.overflowX = "hidden";
    } else {
      document.body.style.overflowX = "";
    }

    return () => {
      document.body.style.overflowX = "";
    };
  }, [screenType]);

  const openPostModal = (type: "image" | "video" | null = null) => {
    setPostInitialType(type);
    setIsPostModalOpen(true);
  };

  const isMobile = screenType === "mobile";
  const isTablet = screenType === "tablet";
  const isDesktop = screenType === "desktop";

  return (
    <>
      <div style={styles.createPostCard}>
        <div
          style={{
            ...styles.createPostTopRow,
            alignItems: isMobile ? "stretch" : "center",
          }}
        >
          {/* ✅ CLICKING HERE NOW OPENS THE MODAL */}
          <div
            onClick={() => openPostModal(null)}
            style={{
              ...styles.fakeInput,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Start a post
          </div>

          <div
            style={{
              ...styles.mediaRowCompact,
              justifyContent: isMobile ? "space-evenly" : "flex-end",
            }}
          >
            <button
              onClick={() => openPostModal("video")}
              style={
                !isDesktop
                  ? { ...styles.mediaBtn, ...styles.mediaBtnIconOnly }
                  : styles.mediaBtn
              }
            >
              <Video size={20} className="text-green-600" />
              {isDesktop && <span style={{ color: "#525252" }}>Video</span>}
            </button>

            <button
              onClick={() => openPostModal("image")}
              style={
                !isDesktop
                  ? { ...styles.mediaBtn, ...styles.mediaBtnIconOnly }
                  : styles.mediaBtn
              }
            >
              <ImageIcon size={20} className="text-blue-500" />
              {isDesktop && <span style={{ color: "#525252" }}>Photo</span>}
            </button>
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        currentUser={currentUser}
        initialMediaType={postInitialType}
      />
    </>
  );
};

// 🟢 UPDATED POST CARD
export const PostCard = ({
  currentUser,
  postData,
}: {
  currentUser?: any;
  postData: any;
}) => {
  const isOwnPost = currentUser?.id === postData?.authorId;

  // 🟢 NEW: Initialize status by checking multiple common properties.
  const [connectionStatus, setConnectionStatus] = useState<
    "none" | "pending" | "connected"
  >(() => {
    if (
      postData?.connectionStatus === "ACCEPTED" ||
      postData?.isConnected === true
    ) {
      return "connected";
    }
    // Check various flags for pending status
    if (
      postData?.connectionStatus === "PENDING" ||
      postData?.isPending === true ||
      postData?.hasPendingRequest === true
    ) {
      return "pending";
    }
    return "none";
  });

  const [isLiked, setIsLiked] = useState(postData?.isLiked || false);
  const [likesCount, setLikesCount] = useState<number>(postData?.likesCount || 0);
  const [sharesCount, setSharesCount] = useState<number>(postData?.sharesCount || 0);
  const [savesCount, setSavesCount] = useState<number>(postData?.savesCount || 0);
  const [commentsCount, setCommentsCount] = useState<number>(postData?.commentsCount || 0);

  const [isSaved, setIsSaved] = useState(postData?.isSaved || false);
  const [showMenu, setShowMenu] = useState(false);

  // 🟢 Comment States
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false); // To avoid re-fetching

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isLoadingConnection, setIsLoadingConnection] = useState(false);

  if (!postData) return null;

  // --- Handlers ---

  const toggleComments = async () => {
    const newState = !showComments;
    setShowComments(newState);

    if (newState && !commentsLoaded) {
      try {
        const res = await fetch(`/api/posts/comments?postId=${postData.id}`);
        const data = await res.json();
        if (data.success) {
          setComments(data.comments);
          setCommentsLoaded(true);
        }
      } catch (e) {
        console.error("Failed to load comments");
      }
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setLoadingComment(true);
    try {
      const res = await fetch("/api/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postData.id, content: commentText }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Comment added!");
        setCommentText("");
        setCommentsCount((prev: number) => prev + 1);

        // 🟢 Add new comment to list immediately
        if (data.comment) {
          const newComment = data.comment.user
            ? data.comment
            : {
              ...data.comment,
              user: {
                fullName: currentUser?.fullName || "Me",
                profileImage: currentUser?.profileImage,
                id: currentUser?.id,
              },
            };
          setComments((prev) => [newComment, ...prev]);
        }
      } else {
        toast.error("Failed to comment");
      }
    } catch (e) {
      toast.error("Error posting comment");
    } finally {
      setLoadingComment(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!confirm("Withdraw connection request?")) return;
    setIsLoadingConnection(true);

    try {
      // We need the connection ID to delete it. 
      // If your backend supports deleting by userId, use that.

      // Fallback: If we don't have a specific connectionId from the feed, 
      // we might need an endpoint that accepts receiverId.
      // BUT usually, Feed API provides 'connectionId'. 

      const targetId = postData.connectionId;

      // If connectionId is missing (sometimes happens in feeds), we usually need to find it

      let url = `/api/users/connections/${targetId}`;
      let method = "DELETE";
      let body = null;

      // 🟢 EDGE CASE: If we just clicked "Connect" locally, we might not have the ID yet.
      // In a real app, you'd refresh the feed or return the ID from the connect API.

      if (!targetId) {
        // If no ID, we try to delete by user logic if your API supports it, 
        // OR we just assume success for UI if it was a fresh optimistic update.
        // Ideally, fetch the connection ID first.
        console.warn("No connection ID available to cancel immediately");
        setConnectionStatus("none");
        setIsLoadingConnection(false);
        return;
      }

      const res = await fetch(url, { method });

      if (res.ok) {
        setConnectionStatus("none"); // Reset to "Connect" button
        toast.success("Request withdrawn");
      } else {
        toast.error("Failed to withdraw");
      }
    } catch (e) {
      toast.error("Error withdrawing request");
    } finally {
      setIsLoadingConnection(false);
    }
  };

  const handleConnect = async () => {
    setIsLoadingConnection(true);
    try {
      const res = await fetch("/api/users/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: postData.authorId }),
      });
      if (res.ok) {
        // 🟢 FIX: Immediately set to 'pending' so button disappears
        setConnectionStatus("pending");
        toast.success("Connection request sent!");
        setShowMenu(false);
      } else {
        const data = await res.json();
        // If API says request already exists, treat as pending
        if (data.error?.includes("already")) {
          setConnectionStatus("pending");
          toast.error("Request already pending");
        } else {
          toast.error("Failed to connect");
        }
      }
    } catch (e) {
      toast.error("Error connecting");
    } finally {
      setIsLoadingConnection(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch("/api/posts/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postData.id }),
      });
      if (res.ok) {
        toast.success("Post deleted");
        window.location.reload();
      } else {
        toast.error("Failed to delete");
      }
    } catch (e) {
      toast.error("Error deleting post");
    }
  };

  // ... (Other handlers: Report, Disconnect, Like, Save, Share... keep same as before)
  const handleDisconnect = async () => {
    // 1. Determine the ID to send.
    const contactId = postData.connectionId || postData.authorId;

    if (!contactId) {
      toast.error("Cannot disconnect: ID missing");
      return;
    }

    if (!confirm("Are you sure you want to remove this connection?")) return;

    try {
      // 2. Exact fetch logic from your Dashboard
      const res = await fetch(`/api/users/connections/${contactId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to remove connection");
      }

      // 3. Update Local State
      setConnectionStatus("none"); // ✅ Change to None
      setShowMenu(false);

      // 4. Success Message & Sync Events (Copied from Dashboard)
      toast.success("Connection removed successfully");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("connections-updated"));
      }
    } catch (e: any) {
      console.error("Delete connection error:", e);
      toast.error(e?.message || "Failed to remove connection");
    }
  };

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev: number) => (newLiked ? prev + 1 : prev - 1));
    try {
      await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postData.id }),
      });
    } catch (e) {
      setIsLiked(!newLiked);
      setLikesCount((prev: number) => (newLiked ? prev - 1 : prev + 1));
    }
  };
  const handleSave = async () => {
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    setSavesCount((prev) => (newSaved ? prev + 1 : prev - 1));
    setShowMenu(false);
    try {
      await fetch("/api/posts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postData.id }),
      });
      toast.success(newSaved ? "Post saved!" : "Removed from saved");
    } catch (e) {
      setIsSaved(!newSaved);
      setSavesCount((prev) => (newSaved ? prev - 1 : prev + 1));
      toast.error("Action failed");
    }
  };

  const trackShare = async () => {
    // Optimistic UI Update (Instant +1)
    setSharesCount((prev) => prev + 1);

    try {
      // Call Database
      await fetch("/api/posts/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postData.id }),
      });
    } catch (e) {
      console.error("Failed to record share");
      // Optional: Revert count if failed
      setSharesCount((prev) => prev - 1);
    }
  };

  const handleCopyLink = () => {
    setShowMenu(false);
    navigator.clipboard.writeText(
      `${window.location.origin}/post/${postData.id}`
    );
    toast.success("Copied!");

    // Track it!
    trackShare();
  };

  const handleShareClick = async () => {
    try {
      setIsShareModalOpen(true);
      setShowMenu(false);
    } catch (e) {
      toast.error("Couldn't open share modal");
    }
  };

  const myAvatar = currentUser?.profileImage;
  const myInitials = getInitials(currentUser?.fullName || "Me");
  const authorName = postData.author?.fullName || "User";
  const authorTitle = postData.author?.title || "Member";
  const authorImage = postData.author?.profileImage;
  const authorInitials = getInitials(authorName);

  return (
    <div style={styles.postCard}>
      {showMenu && (
        <div style={styles.menuBackdrop} onClick={() => setShowMenu(false)} />
      )}

      <div style={styles.postHeader}>
        <Link
          href={`/dashboard/profile/${postData.authorId}`}
          style={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            flex: 1,
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer"
          }}
        >
          <div
            style={{
              position: "relative",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              backgroundColor: "#f3f4f6",
              cursor: "default",
            }}
          >
            {authorImage ? (
              <Image
                src={authorImage}
                alt={authorName}
                fill
                unoptimized
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#64748b",
                }}
              >
                {authorInitials}
              </div>
            )}
          </div>
          <div style={styles.postMeta}>
            <h3
              style={{
                fontWeight: "700",
                fontSize: "14px",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                ...truncateStyle,
              }}
            >
              {authorName}{" "}
              <Check
                size={12}
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px",
                  flexShrink: 0,
                }}
              />
            </h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "11px",
                margin: 0,
                ...truncateStyle,
              }}
            >
              {authorTitle}
            </p>
            {/* Timestamp underneath designation */}
            <p
              style={{
                color: "#94a3b8", // lighter gray than title
                fontSize: "10px",
                margin: "2px 0 0 0",
                ...truncateStyle,
              }}
            >
              {getRelativeTime(postData.createdAt)}
            </p>
          </div>
        </Link>
        <div style={styles.headerActions}>
          {!isOwnPost && connectionStatus !== "connected" && (
            <button
              onClick={connectionStatus === "pending" ? handleCancelRequest : handleConnect}
              disabled={isLoadingConnection}
              style={{
                backgroundColor: connectionStatus === "pending" ? "#f1f5f9" : "#2563eb",
                color: connectionStatus === "pending" ? "#64748b" : "white",
                border: connectionStatus === "pending" ? "1px solid #e2e8f0" : "none",
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "12px", // Slightly larger for icon alignment
                fontWeight: "700",
                cursor: connectionStatus === "pending" ? "default" : "pointer",
                transition: "background 0.2s",
                opacity: isLoadingConnection ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "6px", // Space between clock and text
              }}
            >
              {isLoadingConnection ? (
                <Loader2 size={12} className="animate-spin" />
              ) : connectionStatus === "pending" ? (
                // 🟢 NEW PENDING STATE WITH CLOCK
                <>
                  <Clock size={14} />
                  <span>Pending</span>
                </>
              ) : (
                "Connect"
              )}
            </button>
          )}

          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <MoreHorizontal size={20} color="#94a3b8" />
          </button>
          {showMenu && (
            <div style={styles.menuDropdown}>
              <button style={styles.menuItem} onClick={handleCopyLink}>
                <Copy size={16} /> Copy Link
              </button>

              {isOwnPost ? (
                <button
                  style={{ ...styles.menuItem, color: "#ef4444" }}
                  onClick={handleDelete}
                >
                  <Trash2 size={16} /> Delete Post
                </button>
              ) : (
                <>
                  {/* Report Button Removed */}

                  {/* MORE OPTIONS LOGIC */}

                  {/* 1. NOT CONNECTED: Show Connect */}
                  {connectionStatus === "none" && (
                    <button
                      style={{
                        ...styles.menuItem,
                        color: "#2563eb",
                        opacity: isLoadingConnection ? 0.5 : 1,
                      }}
                      onClick={handleConnect}
                      disabled={isLoadingConnection}
                    >
                      <UserPlus size={16} />{" "}
                      {isLoadingConnection ? "Connecting..." : "Connect"}
                    </button>
                  )}

                  {/* 2. PENDING: Show Pending Text (Disabled) */}
                  {connectionStatus === "pending" && (
                    <button style={{ ...styles.menuItem, color: "#64748b", whiteSpace: "nowrap" }} onClick={handleCancelRequest} disabled={isLoadingConnection}>
                      <UserMinus size={16} /> Cancel Request
                    </button>
                  )}

                  {/* 3. CONNECTED: Show Disconnect */}
                  {connectionStatus === "connected" && (
                    <button
                      style={{
                        ...styles.menuItem,
                        color: "#ef4444",
                      }}
                      onClick={handleDisconnect}
                    >
                      <UserMinus size={16} /> Disconnect
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        {postData.content && (
          <p
            style={{
              fontSize: "15px",
              margin: "0 0 10px 0",
              lineHeight: "1.5",
              color: "#334155",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {postData.content}
          </p>
        )}
        {postData.imageUrl && (
          <div className="post-media-wrapper">
            <div
              className="post-media-blur"
              style={{
                backgroundImage: `url(${postData.imageUrl})`,
                pointerEvents: "none"
              }}
            />

            {postData.imageUrl.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? (
              <video
                src={postData.imageUrl}
                controls
                playsInline
                preload="metadata"
                className="post-media-main"
                style={{ position: "relative", zIndex: 20, pointerEvents: "auto" }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (e.currentTarget.paused) {
                    e.currentTarget.play().catch(console.error);
                  } else {
                    e.currentTarget.pause();
                  }
                }}
              />
            ) : (
              <img
                src={postData.imageUrl}
                alt="Post media"
                className="post-media-main"
              />
            )}
          </div>
        )}
      </div>
      <div style={styles.actionRow}>
        <div style={{ display: "flex", gap: "16px", color: "#64748b" }}>
          <button
            onClick={handleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: isLiked ? "#ef4444" : "#64748b",
            }}
          >
            <Heart
              size={18}
              fill={isLiked ? "#ef4444" : "none"}
              color={isLiked ? "#ef4444" : "currentColor"}
            />{" "}
            {likesCount.toLocaleString()}
          </button>
          {/* Toggle Comments on Click */}
          <button
            onClick={toggleComments}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: showComments ? "#2563eb" : "#64748b",
            }}
          >
            <MessageCircle size={18} fill={showComments ? "#dbeafe" : "none"} />{" "}
            {commentsCount.toLocaleString()}
          </button>
          <button
            onClick={handleShareClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px", // Added gap for text
              fontSize: "12px", // Consistent font size
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "#64748b",
            }}
          >
            <Send size={18} color="#94a3b8" />
            {sharesCount.toLocaleString()}
          </button>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: "flex", // Enable flex to align text
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: isSaved ? "#2563eb" : "#94a3b8",
          }}
        >
          <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
          {savesCount.toLocaleString()}
        </button>
      </div>

      {
        showComments && (
          <div style={styles.commentSection}>
            {/* Input Area */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  backgroundColor: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {myAvatar ? (
                  <Image
                    src={myAvatar}
                    alt="Me"
                    fill
                    unoptimized
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#64748b",
                    }}
                  >
                    {myInitials}
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  flex: 1,
                  fontSize: "12px",
                  padding: "8px 12px",
                  borderRadius: "20px",
                  border: "1px solid #e2e8f0",
                  outline: "none",
                  backgroundColor: "#f8fafc",
                }}
              />
              <button
                onClick={handlePostComment}
                disabled={loadingComment || !commentText.trim()}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                {loadingComment ? (
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                ) : (
                  <Send size={16} color="#2563eb" />
                )}
              </button>
            </div>

            {/* 🟢 List of Comments */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {comments.map((c: any) => (
                <div key={c.id || Math.random()} style={styles.commentItem}>
                  <div
                    style={{
                      position: "relative",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      flexShrink: 0,
                      backgroundColor: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {c.user?.profileImage ? (
                      <Image
                        src={c.user.profileImage}
                        alt={c.user.fullName}
                        fill
                        unoptimized
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: "700",
                          color: "#64748b",
                        }}
                      >
                        {getInitials(c.user?.fullName || "User")}
                      </span>
                    )}
                  </div>
                  <div style={styles.commentBubble}>
                    <div style={styles.commentUser}>{c.user?.fullName}</div>
                    <div style={styles.commentText}>{c.content}</div>
                  </div>
                </div>
              ))}
              {commentsLoaded && comments.length === 0 && (
                <p
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    textAlign: "center",
                    padding: "4px",
                  }}
                >
                  No comments yet.
                </p>
              )}
            </div>
          </div>
        )
      }
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        postId={postData.id}
        currentUserId={currentUser?.id}
        onShareSuccess={trackShare}
      />


    </div >
  );
};

// ... (SuggestedUsersWidget code remains the same) ...
export const SuggestedUsersWidget = ({
  currentUserId,
}: {
  currentUserId: string;
}) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const [usersRes, acceptedRes, sentRes] = await Promise.all([
          fetch("/api/profile/getuser"),
          fetch("/api/users/connections?type=accepted", {
            credentials: "include",
          }),
          fetch("/api/users/connections?type=sent", { credentials: "include" }),
        ]);
        if (!usersRes.ok) return;
        const usersData = await usersRes.json();
        const existingIds = new Set<string>();
        if (currentUserId) existingIds.add(currentUserId);
        if (acceptedRes.ok) {
          const data = await acceptedRes.json();
          (data.requests || []).forEach((r: any) =>
            existingIds.add(r.user?.id)
          );
        }
        if (sentRes.ok) {
          const data = await sentRes.json();
          (data.requests || []).forEach((r: any) => {
            existingIds.add(r.receiver?.id);
            setSentRequests((prev) => new Set(prev).add(r.receiver?.id));
          });
        }
        const filtered = (usersData.users || [])
          .filter((u: any) => !existingIds.has(u.id))
          .map((u: any) => ({
            id: u.id,
            name: u.fullName,
            title: u.title || "Professional",
            profileImage: u.profileImage,
            city: u.location || "Online",
          }))
          .slice(0, 3);
        setProfiles(filtered);
      } catch (e) {
        console.error("Suggestions error", e);
      } finally {
        setLoading(false);
      }
    };
    if (currentUserId) fetchSuggestions();
  }, [currentUserId]);

  const handleConnect = async (userId: string, name: string) => {
    try {
      setConnectingId(userId);
      const response = await fetch("/api/users/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to connect");
      setSentRequests((prev) => new Set([...prev, userId]));
      toast.success(`Connection request sent to ${name}!`);
    } catch (error: any) {
      console.error("Connection error:", error);
      toast.error(error.message || "Failed to send connection request");
    } finally {
      setConnectingId(null);
    }
  };

  if (loading) return null;
  if (profiles.length === 0) return null;

  return (
    <div style={styles.widgetCard}>
      <div style={styles.widgetHeader}>
        <span>Suggested for you</span>
        <Link
          href="/dashboard/search"
          style={{ fontSize: "11px", color: "#2563eb", textDecoration: "none" }}
        >
          View all
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {profiles.map((p) => {
          const isSent = sentRequests.has(p.id);
          return (
            <div key={p.id} style={styles.userRow}>
              <div
                style={{
                  position: "relative",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {p.profileImage ? (
                  <Image
                    src={p.profileImage}
                    alt={p.name}
                    fill
                    unoptimized
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {" "}
                    {getInitials(p.name)}{" "}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    ...truncateStyle,
                  }}
                >
                  {p.name}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "#64748b",
                    ...truncateStyle,
                  }}
                >
                  {p.title}
                </span>
              </div>
              <button
                onClick={() => !isSent && handleConnect(p.id, p.name)}
                disabled={isSent || connectingId === p.id}
                style={
                  isSent
                    ? { ...styles.connectBtnSmall, ...styles.connectBtnSent }
                    : styles.connectBtnSmall
                }
              >
                {connectingId === p.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : isSent ? (
                  "Sent"
                ) : (
                  "Connect"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
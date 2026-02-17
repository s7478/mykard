"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { ArrowLeft, Plus, Edit2, Trash2, Image as ImageIcon, DollarSign, Eye, Share2, Upload, File, X } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  description: string;
  price?: number;
  images?: string[];
  category?: string;
  views?: number;
  createdAt?: string;
}

interface Card {
  id: string;
  cardName: string;
  documentUrl?: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export default function CataloguePage() {
  const { user: zustandUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "documents">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "service",
    images: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;
      await fetchUserCards();
      await fetchProducts();
    };

    loadData();
  }, [authLoading]);

  const fetchUserCards = async () => {
    try {
      const response = await fetch("/api/card", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch cards");

      const data = await response.json();
      const cardsWithDocuments = (data.cards || []).filter(
        (card: Card) => card.documentUrl
      );
      setCards(cardsWithDocuments);
    } catch (err) {
      console.error("Error fetching cards:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // For now, using localStorage to store products (can be replaced with API)
      const stored = localStorage.getItem("userProducts");
      if (stored) {
        setProducts(JSON.parse(stored));
      }
      // Load uploaded documents
      const storedDocs = localStorage.getItem("uploadedDocuments");
      if (storedDocs) {
        setUploadedDocuments(JSON.parse(storedDocs));
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // Validate file type
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "image/jpeg",
          "image/png",
          "image/webp",
          "text/plain"
        ];

        if (!allowedTypes.includes(file.type)) {
          alert(`File type not supported for ${file.name}. Please upload PDF, Word, Excel, Image, or Text files.`);
          continue;
        }

        // Create file URL using FileReader
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          
          const newDocument: UploadedDocument = {
            id: Date.now().toString() + Math.random(),
            name: file.name,
            url: dataUrl,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
          };

          setUploadedDocuments((prev) => {
            const updated = [...prev, newDocument];
            localStorage.setItem("uploadedDocuments", JSON.stringify(updated));
            return updated;
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("Error uploading document. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (e.target) e.target.value = "";
    }
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      const updated = uploadedDocuments.filter((doc) => doc.id !== id);
      setUploadedDocuments(updated);
      localStorage.setItem("uploadedDocuments", JSON.stringify(updated));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    if (type.includes("image")) return "🖼️";
    return "📁";
  };

  const handleAddProduct = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a product/service title");
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      price: formData.price ? parseFloat(formData.price) : undefined,
      category: formData.category,
      images: formData.images,
      views: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = editingProduct
      ? products.map((p) => (p.id === editingProduct.id ? newProduct : p))
      : [...products, newProduct];

    setProducts(updated);
    localStorage.setItem("userProducts", JSON.stringify(updated));

    resetForm();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product/service?")) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem("userProducts", JSON.stringify(updated));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "service",
      images: [],
    });
    setEditingProduct(null);
    setShowAddProduct(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f2ef", paddingTop: "0px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "32px",
            backgroundImage: "linear-gradient(135deg, #0a66c2 0%, #0856a6 100%)",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(10, 102, 194, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/dashboard/profile"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                cursor: "pointer",
                textDecoration: "none",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  "rgba(255,255,255,0.2)";
              }}
            >
              <ArrowLeft size={22} color="#fff" />
            </Link>
            <div>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#fff",
                  margin: "0 0 4px 0",
                }}
              >
                Business Showcase
              </h1>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", margin: 0 }}>
                Display your products & services professionally
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddProduct(true);
            }}
            style={{
              padding: "12px 24px",
              backgroundColor: "#fff",
              color: "#0a66c2",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <Plus size={18} />
            Add Product / Service
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            borderBottom: "2px solid #e0e0e0",
          }}
        >
          <button
            onClick={() => setActiveTab("products")}
            style={{
              padding: "12px 20px",
              backgroundColor: activeTab === "products" ? "#0a66c2" : "transparent",
              color: activeTab === "products" ? "#fff" : "#666",
              border: "none",
              borderRadius: "6px 6px 0 0",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Products & Services ({filteredProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            style={{
              padding: "12px 20px",
              backgroundColor: activeTab === "documents" ? "#0a66c2" : "transparent",
              color: activeTab === "documents" ? "#fff" : "#666",
              border: "none",
              borderRadius: "6px 6px 0 0",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Documents ({cards.length})
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            {/* Add/Edit Product Form */}
            {showAddProduct && (
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  border: "2px solid #0a66c2",
                }}
              >
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 20px 0" }}>
                  {editingProduct ? "Edit" : "Add New"} Product / Service
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#000" }}>
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Premium Logo Design, Business Consulting"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        marginTop: "6px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#000" }}>
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        marginTop: "6px",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="service">Service</option>
                      <option value="product">Product</option>
                      <option value="package">Package</option>
                      <option value="consultation">Consultation</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#000" }}>
                      Price (Optional)
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px", color: "#0a66c2" }}>$</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="0.00"
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "14px",
                          marginTop: "6px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ gridColumn: "1 / 3" }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#000" }}>
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Describe your product/service in detail. Highlight unique features and benefits..."
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        marginTop: "6px",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / 3" }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#000" }}>
                      Product Images (Optional)
                    </label>
                    <div
                      style={{
                        marginTop: "6px",
                        padding: "16px",
                        border: "2px dashed #0a66c2",
                        borderRadius: "6px",
                        textAlign: "center",
                        cursor: "pointer",
                        backgroundColor: "rgba(10, 102, 194, 0.02)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "rgba(10, 102, 194, 0.06)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "rgba(10, 102, 194, 0.02)";
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <ImageIcon size={28} color="#0a66c2" />
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#0a66c2",
                          }}
                        >
                          Click to upload images
                        </span>
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          PNG, JPG, WebP (Max 5MB each)
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={(e) => {
                            if (e.target.files) {
                              const files = e.target.files;
                              for (let i = 0; i < files.length; i++) {
                                const file = files[i];
                                if (file.size > 5 * 1024 * 1024) {
                                  alert(
                                    `Image ${file.name} is too large. Maximum size is 5MB.`
                                  );
                                  continue;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const dataUrl = event.target
                                    ?.result as string;
                                  setFormData((prev) => ({
                                    ...prev,
                                    images: [...(prev.images || []), dataUrl],
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                          }}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>

                    {/* Image Previews */}
                    {formData.images && formData.images.length > 0 && (
                      <div style={{ marginTop: "16px" }}>
                        <p style={{ fontSize: "12px", color: "#666", margin: "0 0 8px 0" }}>
                          Uploaded Images ({formData.images.length})
                        </p>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                            gap: "12px",
                          }}
                        >
                          {formData.images.map((image, index) => (
                            <div
                              key={index}
                              style={{
                                position: "relative",
                                paddingBottom: "100%",
                                backgroundColor: "#f0f0f0",
                                borderRadius: "6px",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    images: prev.images?.filter(
                                      (_, i) => i !== index
                                    ),
                                  }));
                                }}
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  right: "4px",
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  backgroundColor: "rgba(0,0,0,0.6)",
                                  border: "none",
                                  color: "#fff",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                  <button
                    onClick={handleAddProduct}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: "#0a66c2",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {editingProduct ? "Update" : "Publish"} Product
                  </button>
                  <button
                    onClick={resetForm}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: "#f0f0f0",
                      color: "#666",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            {filteredProducts.length > 0 && (
              <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: "10px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="service">Service</option>
                  <option value="product">Product</option>
                  <option value="package">Package</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <p style={{ fontSize: "16px", color: "#666" }}>Loading...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "24px",
                }}
              >
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "all 0.3s",
                      border: "1px solid #e0e0e0",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 8px 24px rgba(0,0,0,0.15)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.08)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    {/* Product Image/Icon */}
                    <div
                      style={{
                        width: "100%",
                        height: "180px",
                        background: product.images && product.images.length > 0
                          ? `url('${product.images[0]}') center/cover`
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {(!product.images || product.images.length === 0) && (
                        <ImageIcon size={48} color="rgba(255,255,255,0.6)" />
                      )}
                      {product.images && product.images.length > 1 && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            right: "8px",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "600",
                          }}
                        >
                          +{product.images.length - 1} more
                        </div>
                      )}
                      <span
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          backgroundColor: "#0a66c2",
                          color: "#fff",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {product.category}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div style={{ padding: "16px" }}>
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#000",
                          margin: "0 0 8px 0",
                          minHeight: "40px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.title}
                      </h3>

                      <p
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          lineHeight: "1.5",
                          margin: "0 0 12px 0",
                          minHeight: "39px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.description}
                      </p>

                      {/* Price */}
                      {product.price && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#0a66c2",
                            marginBottom: "12px",
                          }}
                        >
                          <DollarSign size={16} />
                          {product.price.toFixed(2)}
                        </div>
                      )}

                      {/* Stats */}
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          fontSize: "12px",
                          color: "#999",
                          marginBottom: "12px",
                          paddingBottom: "12px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Eye size={14} />
                          {product.views || 0} views
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setFormData({
                              title: product.title,
                              description: product.description,
                              price: product.price?.toString() || "",
                              category: product.category || "service",
                              images: product.images || [],
                            });
                            setShowAddProduct(true);
                          }}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            backgroundColor: "#f0f0f0",
                            color: "#0a66c2",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            backgroundColor: "#fee",
                            color: "#d32f2f",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "60px 24px",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#000",
                    margin: "0 0 8px 0",
                  }}
                >
                  {searchQuery || categoryFilter !== "all"
                    ? "No products found"
                    : "Start Building Your Showcase!"}
                </p>
                <p style={{ fontSize: "14px", color: "#666", margin: "0 0 24px 0" }}>
                  {searchQuery || categoryFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Add your first product or service to attract more clients"}
                </p>
                {!searchQuery && categoryFilter === "all" && (
                  <button
                    onClick={() => setShowAddProduct(true)}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#0a66c2",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Add First Product
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <>
            {/* Upload Section */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "2px dashed #0a66c2",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  flexDirection: "column",
                }}
              >
                <Upload size={32} color="#0a66c2" />
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#000",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Upload Your Documents
                  </p>
                  <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
                    PDF, Word, Excel, Images - Max 10MB each
                  </p>
                </div>
                <label
                  style={{
                    padding: "12px 28px",
                    backgroundColor: "#0a66c2",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isUploading ? "not-allowed" : "pointer",
                    opacity: isUploading ? 0.7 : 1,
                  }}
                >
                  {isUploading ? "Uploading..." : "Choose Files"}
                  <input
                    type="file"
                    multiple
                    onChange={handleDocumentUpload}
                    disabled={isUploading}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt"
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            {/* Uploaded Documents */}
            {uploadedDocuments.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#000",
                    marginBottom: "16px",
                  }}
                >
                  Your Uploaded Documents ({uploadedDocuments.length})
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        padding: "20px",
                        border: "1px solid #e0e0e0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        transition: "all 0.3s",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 8px 24px rgba(0,0,0,0.15)";
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(-8px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 2px 8px rgba(0,0,0,0.08)";
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(0)";
                      }}
                    >
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                          color: "#d32f2f",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "transform 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.transform =
                            "scale(1.2)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.transform =
                            "scale(1)";
                        }}
                      >
                        <X size={20} />
                      </button>

                      {/* Document Content */}
                      <a
                        href={doc.url}
                        download={doc.name}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "40px",
                            textAlign: "center",
                            paddingBottom: "8px",
                          }}
                        >
                          {getFileIcon(doc.type)}
                        </div>

                        <div>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#000",
                              margin: "0 0 6px 0",
                              wordBreak: "break-word",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {doc.name}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              fontSize: "12px",
                              color: "#666",
                              marginBottom: "8px",
                            }}
                          >
                            <span>{formatFileSize(doc.size)}</span>
                            <span>•</span>
                            <span>
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p
                            style={{
                              fontSize: "12px",
                              color: "#0a66c2",
                              textDecoration: "underline",
                              margin: 0,
                            }}
                          >
                            ⬇️ Download Document
                          </p>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card Documents */}
            {cards.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#000",
                    marginBottom: "16px",
                  }}
                >
                  Card Documents ({cards.length})
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {cards.map((card) => (
                    <a
                      key={card.id}
                      href={card.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "24px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        textDecoration: "none",
                        color: "#000",
                        transition: "all 0.3s",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "16px",
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.boxShadow =
                          "0 8px 24px rgba(0,0,0,0.15)";
                        target.style.transform = "translateY(-8px)";
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.boxShadow =
                          "0 2px 8px rgba(0,0,0,0.08)";
                        target.style.transform = "translateY(0)";
                      }}
                    >
                      <span style={{ fontSize: "48px" }}>📄</span>
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#000",
                            margin: "0 0 8px 0",
                            wordBreak: "break-word",
                          }}
                        >
                          {card.cardName}
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#0a66c2",
                            textDecoration: "underline",
                            margin: 0,
                          }}
                        >
                          View Document →
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {uploadedDocuments.length === 0 && cards.length === 0 && (
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "60px 24px",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#000",
                    margin: "0 0 8px 0",
                  }}
                >
                  No Documents Found
                </p>
                <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                  Upload documents above or link them to your cards.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

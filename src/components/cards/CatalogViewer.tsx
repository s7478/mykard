"use client";

import React, { useState } from 'react';
import { X, ImageOff } from 'lucide-react';

interface CatalogViewerItem {
    id: string;
    title: string;
    images: any[];
}

interface CatalogViewerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: CatalogViewerItem[];
}

const CatalogViewer: React.FC<CatalogViewerProps> = ({ isOpen, onClose, title, items }) => {
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    if (!isOpen) return null;

    console.log('[CatalogViewer] Received items:', items);

    const validItems = items.filter(
        item => item.title?.trim() || (item.images && item.images.length > 0)
    );

    // Resolve image URL from various possible structures
    const getImageUrl = (img: any): string => {
        if (!img) return '';
        if (typeof img === 'string') return img;
        return img.preview || img.url || img.src || '';
    };

    // Check if URL is a blob: URL (ephemeral, won't work across sessions)
    const isBlobUrl = (url: string): boolean => {
        return url.startsWith('blob:');
    };

    const handleImageError = (imgKey: string, url: string) => {
        console.error(`[CatalogViewer] Image failed to load: ${url} (Key: ${imgKey})`);
        setFailedImages(prev => new Set(prev).add(imgKey));
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(5px)'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '90%',
                    maxWidth: '600px',
                    maxHeight: '85vh',
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'catalogViewerFadeIn 0.3s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}>
                    <h2 style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#fff',
                        margin: 0,
                    }}>
                        {title || 'Catalog'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#fff',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content Area */}
                <div style={{
                    padding: '24px',
                    flex: 1,
                    overflowY: 'auto',
                    backgroundColor: '#fafafa'
                }}>
                    {validItems.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#999',
                            fontSize: '15px'
                        }}>
                            No catalog items to display.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {validItems.map((item) => (
                                <div key={item.id} style={{
                                    background: '#fff',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}>
                                    {/* Item Title */}
                                    {item.title?.trim() && (
                                        <h3 style={{
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: '#333',
                                            margin: '0 0 12px 0',
                                            letterSpacing: '-0.01em'
                                        }}>
                                            {item.title}
                                        </h3>
                                    )}

                                    {/* Image Gallery - 3 Column Grid */}
                                    {item.images && item.images.length > 0 && (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: '12px',
                                            maxHeight: item.images.length > 6 ? '320px' : 'auto',
                                            overflowY: item.images.length > 6 ? 'auto' : 'visible',
                                            overflowX: 'hidden',
                                            width: '100%'
                                        }}>
                                            {item.images.map((img: any, imgIndex: number) => {
                                                const imgUrl = getImageUrl(img);
                                                if (!imgUrl) return null;

                                                const imgKey = `${item.id}-${imgIndex}`;
                                                const isBroken = isBlobUrl(imgUrl) || failedImages.has(imgKey);

                                                // Show placeholder for broken/blob images
                                                if (isBroken) {
                                                    return (
                                                        <div
                                                            key={imgIndex}
                                                            style={{
                                                                position: 'relative',
                                                                aspectRatio: '1 / 1',
                                                                borderRadius: '10px',
                                                                border: '2px dashed #d1d5db',
                                                                background: '#f9fafb',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                                width: '100%',
                                                                color: '#9ca3af',
                                                            }}
                                                        >
                                                            <ImageOff size={24} />
                                                            <span style={{ fontSize: '11px', textAlign: 'center', padding: '0 8px' }}>
                                                                Image unavailable
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={imgIndex}
                                                        style={{
                                                            position: 'relative',
                                                            aspectRatio: '1 / 1',
                                                            borderRadius: '10px',
                                                            overflow: 'hidden',
                                                            border: '1px solid #eee',
                                                            width: '100%',
                                                            backgroundColor: '#f5f5f5'
                                                        }}
                                                    >
                                                        <img
                                                            src={imgUrl}
                                                            alt={`${item.title || 'Catalog'} ${imgIndex + 1}`}
                                                            onClick={() => setLightboxImage(imgUrl)}
                                                            onError={() => handleImageError(imgKey, imgUrl)}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                cursor: 'pointer',
                                                                display: 'block',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lightbox */}
                {lightboxImage && (
                    <div
                        onClick={() => setLightboxImage(null)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2000,
                            cursor: 'pointer'
                        }}
                    >
                        <img
                            src={lightboxImage}
                            alt="Full size"
                            style={{
                                maxWidth: '90%',
                                maxHeight: '90%',
                                objectFit: 'contain',
                                borderRadius: '8px'
                            }}
                        />
                        <button
                            onClick={() => setLightboxImage(null)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>
                )}

                <style>{`
                    @keyframes catalogViewerFadeIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    [id^="catalog-scroll-"]::-webkit-scrollbar { display: none; }
                `}</style>
            </div>
        </div>
    );
};

export default CatalogViewer;


import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export interface CatalogItem {
    id: string;
    title: string;
    images: { preview: string; file?: File }[];
}

interface CatalogPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    initialItems: CatalogItem[];
    onSave: (newTitle: string, newItems: CatalogItem[]) => void;
}

const CatalogPopup: React.FC<CatalogPopupProps> = ({
    isOpen,
    onClose,
    title,
    initialItems,
    onSave,
}) => {
    const [editedTitle, setEditedTitle] = useState(title);
    const [items, setItems] = useState<CatalogItem[]>(initialItems);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // Use a ref to always have access to the latest initialItems
    const initialItemsRef = useRef(initialItems);
    initialItemsRef.current = initialItems;

    // Track if popup was previously open to detect open transitions
    const wasOpenRef = useRef(false);

    useEffect(() => {
        if (isOpen && !wasOpenRef.current) {
            // Popup is opening — initialize from latest props
            console.log('[CatalogPopup] Opening. initialItems:', initialItemsRef.current);
            setEditedTitle(title === 'Catalog' ? '' : title);
            const itemsToSet = initialItemsRef.current.length > 0
                ? initialItemsRef.current
                : [{ id: Date.now().toString(), title: '', images: [] }];
            console.log('[CatalogPopup] Setting items to:', itemsToSet);
            setItems(itemsToSet);
        }
        wasOpenRef.current = isOpen;
    }, [isOpen, title]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        if (editedTitle.trim() === '') {
            setEditedTitle('Catalog');
        }
    };

    const handleSave = () => {
        // Deep log to check for File objects
        const debugItems = items.map(i => ({
            id: i.id,
            images: i.images.map(img => ({
                hasFile: !!img.file,
                fileName: img.file?.name,
                preview: img.preview
            }))
        }));
        console.log('[CatalogPopup] handleSave items dump:', JSON.stringify(debugItems, null, 2));

        const finalTitle = editedTitle.trim() === '' ? 'Catalog' : editedTitle;
        onSave(finalTitle, items);
        // Do NOT call onClose() here — let the parent close after updating state
    };

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), title: '', images: [] }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItemTitle = (id: string, newTitle: string) => {
        setItems(items.map(item => item.id === id ? { ...item, title: newTitle } : item));
    };

    const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages = Array.from(e.target.files).map(file => ({
                preview: URL.createObjectURL(file),
                file: file
            }));
            setItems(items.map(item =>
                item.id === id ? { ...item, images: [...item.images, ...newImages] } : item
            ));
        }
    };

    const removeImage = (itemId: string, imageIndex: number) => {
        setItems(items.map(item => {
            if (item.id === itemId) {
                const newImages = [...item.images];
                newImages.splice(imageIndex, 1);
                return { ...item, images: newImages };
            }
            return item;
        }));
    };

    if (!isOpen) return null;

    return (
        <div style={{
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
        }}>
            <div style={{
                width: '90%',
                maxWidth: '600px',
                height: '85vh',
                backgroundColor: '#fff',
                borderRadius: '20px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'fadeIn 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#fafafa'
                }}>
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#333',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            width: '100%',
                            marginRight: '20px'
                        }}
                        placeholder="Enter name for catalog"
                        autoFocus
                    />
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f0f0f0',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#666',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div style={{
                    padding: '24px',
                    flex: 1,
                    overflowY: 'auto',
                    backgroundColor: '#fff'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {items.map((item, index) => (
                            <div key={item.id} style={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '12px',
                                padding: '16px',
                                position: 'relative',
                                backgroundColor: '#fff'
                            }}>
                                {/* Remove Item Button */}
                                {items.length > 1 && (
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        style={{
                                            position: 'absolute',
                                            top: '16px',
                                            right: '16px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#999',
                                            cursor: 'pointer',
                                            padding: '4px'
                                        }}
                                        title="Remove Section"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                                {/* Title Input */}
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateItemTitle(item.id, e.target.value)}
                                    placeholder={`Title ${index + 1}`}
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#333',
                                        border: '1px solid #eee',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        width: '100%',
                                        marginBottom: '16px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
                                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                                />

                                {/* Image Grid - 3 Columns with 2 Rows initially, then scrollable */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Add Image Button - Full Width */}
                                    <label style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        border: '2px dashed #4F46E5',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#4F46E5',
                                        backgroundColor: '#EEF2FF',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#E0E7FF';
                                        e.currentTarget.style.borderColor = '#4338CA';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = '#EEF2FF';
                                        e.currentTarget.style.borderColor = '#4F46E5';
                                    }}>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(item.id, e)}
                                            style={{ display: 'none' }}
                                        />
                                        <Plus size={20} />
                                        <span style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>Add Images</span>
                                    </label>

                                    {/* Images Grid - 3 columns */}
                                    {item.images.length > 0 && (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: '12px',
                                            maxHeight: item.images.length > 6 ? '350px' : 'auto',
                                            overflowY: item.images.length > 6 ? 'auto' : 'visible',
                                            overflowX: 'hidden',
                                            width: '100%'
                                        }}>
                                            {item.images.map((imgObj, imgIndex) => (
                                                <div key={imgIndex} style={{
                                                    position: 'relative',
                                                    aspectRatio: '1 / 1',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    backgroundColor: '#f5f5f5',
                                                    border: '1px solid #e8e8e8',
                                                    width: '100%'
                                                }}>
                                                    <img
                                                        src={imgObj.preview}
                                                        alt={`Preview ${imgIndex}`}
                                                        onClick={() => setLightboxImage(imgObj.preview)}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            cursor: 'pointer',
                                                            display: 'block'
                                                        }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeImage(item.id, imgIndex);
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '5px',
                                                            right: '5px',
                                                            background: 'rgba(255, 255, 255, 0.95)',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '50%',
                                                            width: '26px',
                                                            height: '26px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            color: '#999',
                                                            padding: 0,
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#ff5555';
                                                            e.currentTarget.style.color = '#fff';
                                                            e.currentTarget.style.borderColor = '#ff5555';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                                                            e.currentTarget.style.color = '#999';
                                                            e.currentTarget.style.borderColor = '#e0e0e0';
                                                        }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Add Item Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={addItem}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#4F46E5',
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#EEF2FF'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    backgroundColor: '#fff'
                }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '10px 32px',
                            background: '#4F46E5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                        }}
                    >
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 32px',
                            background: '#f3f4f6',
                            color: '#333',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
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
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
            </div>
        </div>
    );
};

export default CatalogPopup;

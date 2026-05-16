import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

import '../../styles/navbarRoutes/editableCardImage.css';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function EditableCardImage({ imageUrl, alt, canEdit = false, onUpload }){
    const [localImageUrl, setLocalImageUrl] = useState(imageUrl);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        setLocalImageUrl(imageUrl);
    }, [imageUrl]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const uploadImage = async (file) => {
        if (!file || !canEdit || uploading) return;

        if (!IMAGE_TYPES.includes(file.type)) {
            toast.error('Photo must be JPG, PNG, WEBP, or GIF.');
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            toast.error('Photo must be 5 MB or smaller.');
            return;
        }

        const nextPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(nextPreviewUrl);
        setUploading(true);

        try {
            const uploadedImageUrl = await onUpload(file);
            if (uploadedImageUrl) setLocalImageUrl(uploadedImageUrl);
            toast.success('Photo updated.');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to update photo.');
        } finally {
            setUploading(false);
            setPreviewUrl('');
            setIsDragging(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
        }
    };

    const imageContent = (
        <>
            <img className="editable-card-image" src={previewUrl || localImageUrl} alt={alt} />
            {canEdit && (
                <span className="editable-card-image-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faCamera} />
                </span>
            )}
            {uploading && <span className="editable-card-image-status">Uploading...</span>}
        </>
    );

    return(
        <div className={`editable-card-photo${canEdit ? ' can-edit' : ''}${isDragging ? ' is-dragging' : ''}`}>
            {canEdit ? (
                <>
                    <button
                        className="editable-card-image-button"
                        type="button"
                        aria-label={`Update ${alt}`}
                        disabled={uploading}
                        onClick={() => inputRef.current?.click()}
                        onKeyDown={handleKeyDown}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            uploadImage(e.dataTransfer.files?.[0]);
                        }}
                    >
                        {imageContent}
                    </button>
                    <input
                        ref={inputRef}
                        className="editable-card-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => uploadImage(e.target.files?.[0])}
                    />
                </>
            ) : (
                <div className="editable-card-image-button">
                    {imageContent}
                </div>
            )}
        </div>
    );
}

export default EditableCardImage

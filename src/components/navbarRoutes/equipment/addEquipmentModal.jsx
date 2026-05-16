import React, { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import { authFetch } from "../../export/utility.jsx";
import '../../../styles/navbarRoutes/equipment/requestEquipmentModal.css';


function AddEquipmentModal({ setShowAddEquipmentModal, onEquipmentAdded }){

    const [equipmentName, setEquipmentName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const handleImageFile = (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file.');
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleFileChange = (e) => {
        handleImageFile(e.target.files?.[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleImageFile(e.dataTransfer.files?.[0]);
    };

    const handleDropzoneKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
        }
    };

    const clearImageFile = (e) => {
        e.stopPropagation();
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedEquipmentName = equipmentName.trim();

        if (!trimmedEquipmentName) {
            toast.error('Please enter an equipment name.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('equipmentName', trimmedEquipmentName);
            if (imageFile) formData.append('image', imageFile);

            const response = await authFetch('/equipment-item', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                toast.success('Equipment added successfully.');
                if (onEquipmentAdded) await onEquipmentAdded();
                setShowAddEquipmentModal(false);
            } else {
                toast.error(data.message || 'Failed to add equipment.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="modal-overlay">
            <div className="equipment-request-modal-container">
                <form className="request-form" onSubmit={handleSubmit}>
                    <h1>Add Equipment</h1>

                    <div className="form-group">
                        <label htmlFor="equipment-name" className="req-label">Name:</label>
                        <input
                            id="equipment-name"
                            className="req-input"
                            type="text"
                            value={equipmentName}
                            onChange={e => setEquipmentName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="equipment-image" className="req-label">Photo:</label>
                        <div
                            className={`photo-dropzone${isDragging ? ' is-dragging' : ''}${imagePreview ? ' has-preview' : ''}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={handleDropzoneKeyDown}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                id="equipment-image"
                                ref={fileInputRef}
                                className="photo-file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            {imagePreview ? (
                                <>
                                    <img className="photo-preview" src={imagePreview} alt="Equipment preview" />
                                    <button
                                        className="photo-remove-btn"
                                        type="button"
                                        aria-label="Remove selected photo"
                                        onClick={clearImageFile}
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                    <span className="photo-file-name">{imageFile?.name}</span>
                                </>
                            ) : (
                                <div className="photo-empty-state">
                                    <FontAwesomeIcon className="photo-upload-icon" icon={faImage} />
                                    <span>Upload or drag photo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="req-btns-container">
                        <button
                            className="req-btns"
                            type="button"
                            onClick={() => setShowAddEquipmentModal(false)}
                        >
                            CANCEL
                        </button>

                        <button className="req-btns" type="submit" disabled={loading}>
                            {loading ? 'SAVING...' : 'ADD'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddEquipmentModal

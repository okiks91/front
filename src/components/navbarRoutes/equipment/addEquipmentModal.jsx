import React, { useState } from "react";

import { toast } from "react-toastify";
import { authFetch } from "../../export/utility.jsx";
import '../../../styles/navbarRoutes/equipment/requestEquipmentModal.css';


function AddEquipmentModal({ setShowAddEquipmentModal, onEquipmentAdded }){

    const [equipmentName, setEquipmentName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedEquipmentName = equipmentName.trim();
        const trimmedImageUrl = imageUrl.trim();

        if (!trimmedEquipmentName) {
            toast.error('Please enter an equipment name.');
            return;
        }

        setLoading(true);

        try {
            const response = await authFetch('/equipment-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    equipmentName: trimmedEquipmentName,
                    ...(trimmedImageUrl ? { imageUrl: trimmedImageUrl } : {}),
                }),
            });

            const data = await response.json();

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
                        <label htmlFor="equipment-image-url" className="req-label">Image URL:</label>
                        <input
                            id="equipment-image-url"
                            className="req-input"
                            type="text"
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                        />
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

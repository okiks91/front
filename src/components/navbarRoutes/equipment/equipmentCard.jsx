import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faTrash } from '@fortawesome/free-solid-svg-icons';


import EditableCardImage from '../../export/editableCardImage.jsx';
import RequestEquipmentModal from './requestEquipmentModal.jsx';
import ReserveEquipmentModal from './reserveEquipmentModal.jsx';
import { authFetch, getCookie } from '../../export/utility';


import '../../../styles/navbarRoutes/equipment/equipmentCard.css';


function EquipmentCard({
    id,
    imageUrl,
    equipmentName,
    onStatusChanged,
    onImageUpdated,
    onDeleted
}){

    const user = JSON.parse(getCookie("user") || 'null');
    const role = user?.role;
    const [modalType, setModalType] = useState(null);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const allowedRoles = role === "studentOfficer" || role === "schoolFaculty";
    const isAdmin = role === "systemAdmin";

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        if (id) formData.append('id', id);
        formData.append('equipmentName', equipmentName);
        formData.append('image', file);

        const response = await authFetch('/equipment-item/image', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update equipment photo.');
        }

        await onImageUpdated?.(data);
        return data.imageUrl;
    };

    const handleDeleteEquipment = async () => {
        setDeleting(true);

        try {
            const response = await authFetch('/equipment-item', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(id ? { id } : {}),
                    equipmentName,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete equipment.');
            }

            toast.success('Equipment deleted.');
            setShowActionMenu(false);
            await onDeleted?.({ id, equipmentName });
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Could not delete equipment.');
        } finally {
            setDeleting(false);
        }
    };

    return(
        <>
            <div className="equipmentCard">
                {isAdmin && (
                    <div className={`equipment-card-actions${showActionMenu ? ' is-open' : ''}`}>
                        <button
                            className="equipment-card-menu-btn"
                            type="button"
                            aria-label={`Open actions for ${equipmentName}`}
                            onClick={() => setShowActionMenu(prev => !prev)}
                        >
                            <FontAwesomeIcon icon={faEllipsis} />
                        </button>

                        {showActionMenu && (
                            <div className="equipment-card-action-menu">
                                <button
                                    className="equipment-card-delete-btn"
                                    type="button"
                                    onClick={handleDeleteEquipment}
                                    disabled={deleting}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                <EditableCardImage
                    imageUrl={imageUrl}
                    alt={`${equipmentName} equipment photo`}
                    canEdit={isAdmin}
                    onUpload={handleImageUpload}
                />
                <h1 className="equipment-name">{equipmentName}</h1>

                {allowedRoles && ( 
                    <button 
                        className="choice-equipment" 
                        onClick={() => setModalType("request")}
                    >
                        REQUEST
                    </button>
                )}

                {isAdmin && (
                    <button 
                        className="choice-equipment" 
                        onClick={() => setModalType("reserve")}
                    >   
                        SET STATUS
                    </button>
                )}
            </div>

            {modalType === "request" && (
                <RequestEquipmentModal
                    setModalType={setModalType}
                    equipmentName={equipmentName}
                    onRequestSubmitted={onStatusChanged}
                />
            )}

            {modalType === "reserve" && (
                <ReserveEquipmentModal
                    setModalType={setModalType}
                    equipmentName={equipmentName}
                    onStatusChanged={onStatusChanged}
                />
            )}
        </>
    );
}

export default EquipmentCard

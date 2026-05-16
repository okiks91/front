import React, { useState } from 'react';


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
    onImageUpdated
}){

    const user = JSON.parse(getCookie("user") || 'null');
    const role = user?.role;
    const [modalType, setModalType] = useState(null);

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

    return(
        <>
            <div className="equipmentCard">
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

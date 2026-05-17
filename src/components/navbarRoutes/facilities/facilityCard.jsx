import React, { useState } from 'react';


import EditableCardImage from '../../export/editableCardImage.jsx';
import ReserveFacilityModal from './reserveFacilityModal.jsx';
import OccupyFacilityModal from './occupyFacilityModal.jsx';
import { authFetch, getStoredUser } from '../../export/utility.jsx';


import '../../../styles/navbarRoutes/facilities/facilityCard.css';


function FacilityCard({ imageUrl, roomName, floorId, floorName, onOccupied, onImageUpdated }){

    const user = getStoredUser();
    const role = user?.role;
    const [showReserveFacilityModal, setReserveFacilityModal] = useState(false);
    const [showOccupyFacilityModal, setOccupyFacilityModal] = useState(false);
    const isAdmin = role === "systemAdmin";

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('floorId', floorId);
        formData.append('floorName', floorName);
        formData.append('roomName', roomName);
        formData.append('image', file);

        const response = await authFetch('/facility-image', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update facility photo.');
        }

        onImageUpdated?.({
            floorId,
            floorName,
            roomName,
            imageUrl: data.imageUrl,
            ...data,
        });

        return data.imageUrl;
    };

    return(
        <> 
            <div className="facilityCard">
                <EditableCardImage
                    imageUrl={imageUrl}
                    alt={`${roomName} facility photo`}
                    canEdit={isAdmin}
                    onUpload={handleImageUpload}
                />
                <h1 className="facility-name">{roomName}</h1>

                {role === "studentOfficer" && ( 
                    <button 
                        className="choice-room" 
                        onClick={() => setOccupyFacilityModal(true)}
                    >
                        OCCUPY
                    </button>
                )}
                
                {role === "systemAdmin" && (
                    <button 
                        className="choice-room" 
                        onClick={() => setReserveFacilityModal(true)}
                    >
                        RESERVE
                    </button>
                )}
            </div>

            {showReserveFacilityModal && (
                <ReserveFacilityModal
                    setReserveFacilityModal={setReserveFacilityModal}
                    roomName={roomName}
                    floorName={floorName}
                />
            )}
            {showOccupyFacilityModal && (
                <OccupyFacilityModal
                    setOccupyFacilityModal={setOccupyFacilityModal}
                    roomName={roomName}
                    floorName={floorName}
                    onOccupied={onOccupied}
                />
            )}
        </>
    );
}

export default FacilityCard

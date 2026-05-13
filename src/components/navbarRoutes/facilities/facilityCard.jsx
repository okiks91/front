import React, { useState } from 'react';


import ReserveFacilityModal from './reserveFacilityModal.jsx';
import OccupyFacilityModal from './occupyFacilityModal.jsx';
import { getCookie } from '../../export/utility.jsx';


import '../../../styles/navbarRoutes/facilities/facilityCard.css';


function FacilityCard({ imageUrl, roomName, floorName, onOccupied }){

    const user = JSON.parse(getCookie("user") || 'null');
    const role = user?.role;
    const [showReserveFacilityModal, setReserveFacilityModal] = useState(false);
    const [showOccupyFacilityModal, setOccupyFacilityModal] = useState(false);

    return(
        <> 
            <div className="facilityCard">
                <img className="card-image" src={imageUrl} alt='facility-image'></img>
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

import React, { useState } from 'react';


import RequestEquipmentModal from './requestEquipmentModal.jsx';
import ReserveEquipmentModal from './reserveEquipmentModal.jsx';
import { getCookie } from '../../export/utility';


import '../../../styles/navbarRoutes/equipment/equipmentCard.css';


function EquipmentCard({
    imageUrl,
    equipmentName,
    onStatusChanged
}){

    const user = JSON.parse(getCookie("user"));
    const role = user?.role;
    const [modalType, setModalType] = useState(null);

    const allowedRoles = role === "studentOfficer" || role === "schoolFaculty";
    const isAdmin = role === "systemAdmin";

    return(
        <>
            <div className="equipmentCard">
                <img className="card-image" src={imageUrl} alt='equipment-image'></img>
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
                <RequestEquipmentModal setModalType={setModalType} equipmentName={equipmentName}/>
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

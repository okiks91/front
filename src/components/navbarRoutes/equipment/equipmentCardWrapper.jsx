import React, { useState } from "react";


import AddEquipmentModal from './addEquipmentModal.jsx';
import EquipmentCard from './equipmentCard.jsx';
import { equipmentArray } from '../../export/constant.jsx';
import { getCookie } from '../../export/utility.jsx';


import '../../../styles/navbarRoutes/equipment/equipmentCardWrapper.css';


function EquipmentCardWrapper({ equipmentItems = [], equipmentStatuses = [], onEquipmentAdded, onStatusChanged }){

    const user = JSON.parse(getCookie("user") || 'null');
    const role = user?.role;
    const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
    const unavailableEquipment = new Set(
        equipmentStatuses
            .filter(status => status.status === 'Unavailable')
            .map(status => status.equipmentName)
    );
    const defaultEquipmentImage = equipmentArray[0]?.imageUrl || '';
    const equipmentByName = new Map();

    [...equipmentArray, ...equipmentItems].forEach(item => {
        const equipmentName = item?.equipmentName?.trim();
        if (!equipmentName) return;
        equipmentByName.set(equipmentName.toLowerCase(), {
            ...item,
            equipmentName,
            imageUrl: item.imageUrl || defaultEquipmentImage,
        });
    });

    const allEquipment = Array.from(equipmentByName.values());

    const visibleEquipment = role === 'studentOfficer'
        ? allEquipment.filter(item => !unavailableEquipment.has(item.equipmentName))
        : allEquipment;

    return(
        <>
            <div className="equipmentCardWrapper">
                {
                    visibleEquipment.map((value, index) => (
                        <EquipmentCard
                            key={value.id || `${value.equipmentName}-${index}`}
                            id={value.id}
                            imageUrl={value.imageUrl}
                            equipmentName={value.equipmentName}
                            onStatusChanged={onStatusChanged}
                            onImageUpdated={onEquipmentAdded}
                        />
                    ))
                }
                {role === 'systemAdmin' && (
                    <button
                        className="equipmentCard addEquipmentCard"
                        type="button"
                        aria-label="Add equipment"
                        onClick={() => setShowAddEquipmentModal(true)}
                    >
                        <span className="add-card-plus">+</span>
                        <span className="add-card-label">add equipment</span>
                    </button>
                )}
            </div>  

            {showAddEquipmentModal && (
                <AddEquipmentModal
                    setShowAddEquipmentModal={setShowAddEquipmentModal}
                    onEquipmentAdded={onEquipmentAdded}
                />
            )}
        </>
    );
}

export default EquipmentCardWrapper

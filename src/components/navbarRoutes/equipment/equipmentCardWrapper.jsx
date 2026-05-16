import React from "react";


import EquipmentCard from './equipmentCard.jsx';
import { equipmentArray } from '../../export/constant.jsx';
import { getCookie } from '../../export/utility.jsx';


import '../../../styles/navbarRoutes/equipment/equipmentCardWrapper.css';


function EquipmentCardWrapper({ equipmentStatuses = [], onStatusChanged }){

    const user = JSON.parse(getCookie("user") || 'null');
    const role = user?.role;
    const unavailableEquipment = new Set(
        equipmentStatuses
            .filter(status => status.status === 'Unavailable')
            .map(status => status.equipmentName)
    );

    const visibleEquipment = role === 'studentOfficer'
        ? equipmentArray.filter(item => !unavailableEquipment.has(item.equipmentName))
        : equipmentArray;

    return(
        <>
            <div className="equipmentCardWrapper">
                {
                    visibleEquipment.map((value, index) => (
                        <EquipmentCard
                            key={index}
                            imageUrl={value.imageUrl}
                            equipmentName={value.equipmentName}
                            onStatusChanged={onStatusChanged}
                        />
                    ))
                }
                {role === 'systemAdmin' && (
                    <button className="equipmentCard addEquipmentCard" type="button" aria-label="Add equipment">
                        <span className="add-card-plus">+</span>
                        <span className="add-card-label">add equipment</span>
                    </button>
                )}
            </div>  
        </>
    );
}

export default EquipmentCardWrapper

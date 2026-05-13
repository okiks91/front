import React from "react";


import EquipmentCard from './equipmentCard.jsx';
import { equipmentArray } from '../../export/constant.jsx';
import { getCookie } from '../../export/utility.jsx';


import '../../../styles/navbarRoutes/equipment/equipmentCardWrapper.css';


function EquipmentCardWrapper({ equipmentStatuses = [], onStatusChanged }){

    const user = JSON.parse(getCookie("user"));
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
            </div>  
        </>
    );
}

export default EquipmentCardWrapper

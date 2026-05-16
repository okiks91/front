import React from "react";


import FacilityCard from './facilityCard.jsx';
import { facilitiesArray } from '../../export/constant.jsx';
import { getCookie } from '../../export/utility.jsx';


import '../../../styles/navbarRoutes/facilities/facilityCardWrapper.css';


function FacilityCardWrapper({ floorValue, onOccupied }){
    const user = JSON.parse(getCookie("user") || 'null');
    const role = user?.role;
    const floorData = facilitiesArray.find(floor => floor.id === floorValue) || facilitiesArray[0];

    return(
        <>
            <div className="facilityCardWrapper">
                {
                    floorData?.data?.map((value, index) => (
                        <FacilityCard
                            key={index}
                            imageUrl={value.imageUrl}
                            roomName={value.roomName}
                            floorName={floorData.name}
                            onOccupied={onOccupied}
                        />
                    ))
                }
                {role === 'systemAdmin' && (
                    <button className="facilityCard addFacilityCard" type="button" aria-label="Add facility">
                        <span className="add-card-plus">+</span>
                        <span className="add-card-label">add facility</span>
                    </button>
                )}
            </div>
        </>
    );
}

export default FacilityCardWrapper

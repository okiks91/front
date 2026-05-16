import React from "react";


import FacilityCard from './facilityCard.jsx';
import { facilitiesArray } from '../../export/constant.jsx';


import '../../../styles/navbarRoutes/facilities/facilityCardWrapper.css';


function FacilityCardWrapper({ floorValue, onOccupied }){
    const floorData = facilitiesArray.find(floor => floor.id === floorValue) || facilitiesArray[0];

    return(
        <>
            <div className="facilityCardWrapper">
                {
                    floorData?.data?.map((value, index) => (
                        <FacilityCard
                            key={value.id || `${floorData.id}-${value.roomName}-${index}`}
                            imageUrl={value.imageUrl}
                            roomName={value.roomName}
                            floorName={floorData.name}
                            onOccupied={onOccupied}
                        />
                    ))
                }
            </div>
        </>
    );
}

export default FacilityCardWrapper

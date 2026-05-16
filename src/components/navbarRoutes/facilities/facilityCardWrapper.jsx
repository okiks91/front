import React from "react";


import FacilityCard from './facilityCard.jsx';
import { facilitiesArray } from '../../export/constant.jsx';


import '../../../styles/navbarRoutes/facilities/facilityCardWrapper.css';

const getFacilityImageKey = (floorId, roomName) => `${floorId}::${roomName}`.toLowerCase();

function FacilityCardWrapper({ floorValue, facilityImages = {}, onOccupied, onFacilityImageUpdated }){
    const floorData = facilitiesArray.find(floor => floor.id === floorValue) || facilitiesArray[0];

    return(
        <>
            <div className="facilityCardWrapper">
                {
                    floorData?.data?.map((value, index) => (
                        <FacilityCard
                            key={value.id || `${floorData.id}-${value.roomName}-${index}`}
                            imageUrl={facilityImages[getFacilityImageKey(floorData.id, value.roomName)] || value.imageUrl}
                            roomName={value.roomName}
                            floorId={floorData.id}
                            floorName={floorData.name}
                            onOccupied={onOccupied}
                            onImageUpdated={onFacilityImageUpdated}
                        />
                    ))
                }
            </div>
        </>
    );
}

export default FacilityCardWrapper

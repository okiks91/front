import React, { useState, useEffect } from "react";


import FacilityCard from './facilityCard.jsx';
import { facilitiesArray } from '../../export/constant.jsx';


import '../../../styles/navbarRoutes/facilities/facilityCardWrapper.css';


function FacilityCardWrapper({ floorValue, onOccupied }){
    const [floorData, setFloorData] = useState(facilitiesArray[0]);

    useEffect(() => {
        const facility = facilitiesArray.find(floor => floor.id === floorValue);
        setFloorData(facility);
    }, [floorValue]);

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
            </div>
        </>
    );
}

export default FacilityCardWrapper

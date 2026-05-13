import React from "react";


import MemberCard from './memberCard.jsx';
import { memberArray } from '../../export/constant.jsx';


import '../../../styles/navbarRoutes/about/memberCardWrapper.css';


function MemberCardWrapper(){
    return(
        <>
            <div className="memberCardWrapper">
                {
                    memberArray.map((value, index) => (
                        <MemberCard key={index} imageUrl={value.imageUrl} name={value.name} role={value.role}/>
                    ))
                }
            </div>
        </>
    );
}

export default MemberCardWrapper
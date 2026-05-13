import React from 'react';


import '../../../styles/navbarRoutes/about/memberCard.css';


function MemberCard({
    imageUrl,
    name,
    role
}){
    return(
        <div className="memberCard">
            <img className="card-image" src={imageUrl} alt="profile-picture"/>
            <h2 className="member-name">{name}</h2> 
            <p className="member-role">{role}</p>
        </div>
    );
}

export default MemberCard
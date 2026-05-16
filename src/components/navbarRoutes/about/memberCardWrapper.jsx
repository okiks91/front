import React, { useEffect, useState } from "react";


import MemberCard from './memberCard.jsx';
import { memberArray } from '../../export/constant.jsx';
import { authFetch } from '../../export/utility.jsx';


import '../../../styles/navbarRoutes/about/memberCardWrapper.css';

const getMemberImageKey = (memberName) => String(memberName || '').trim().toLowerCase();

function MemberCardWrapper(){
    const [memberImages, setMemberImages] = useState({});

    useEffect(() => {
        authFetch('/project-team-images')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const items = Array.isArray(data) ? data : data?.items || data?.projectTeamImages || [];
                const nextMemberImages = {};

                items.forEach(item => {
                    const memberName = item?.memberName || item?.name;
                    if (!memberName || !item?.imageUrl) return;
                    nextMemberImages[getMemberImageKey(memberName)] = item.imageUrl;
                });

                setMemberImages(nextMemberImages);
            })
            .catch(err => console.error(err));
    }, []);

    const handleMemberImageUpdated = (item) => {
        const memberName = item?.memberName || item?.name;
        if (!memberName || !item?.imageUrl) return;

        setMemberImages(prev => ({
            ...prev,
            [getMemberImageKey(memberName)]: item.imageUrl,
        }));
    };

    return(
        <>
            <div className="memberCardWrapper">
                {
                    memberArray.map((value, index) => (
                        <MemberCard
                            key={index}
                            imageUrl={memberImages[getMemberImageKey(value.name)] || value.imageUrl}
                            name={value.name}
                            role={value.role}
                            onImageUpdated={handleMemberImageUpdated}
                        />
                    ))
                }
            </div>
        </>
    );
}

export default MemberCardWrapper

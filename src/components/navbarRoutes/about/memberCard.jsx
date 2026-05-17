import React from 'react';


import EditableCardImage from '../../export/editableCardImage.jsx';
import { authFetch, getStoredUser } from '../../export/utility.jsx';
import '../../../styles/navbarRoutes/about/memberCard.css';


function MemberCard({
    imageUrl,
    name,
    role,
    onImageUpdated
}){
    const user = getStoredUser();
    const isAdmin = user?.role === 'systemAdmin';

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append('memberName', name);
        formData.append('memberRole', role);
        formData.append('image', file);

        const response = await authFetch('/project-team-image', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update project team photo.');
        }

        onImageUpdated?.({
            memberName: name,
            memberRole: role,
            imageUrl: data.imageUrl,
            ...data,
        });

        return data.imageUrl;
    };

    return(
        <div className="memberCard">
            <EditableCardImage
                imageUrl={imageUrl}
                alt={`${name} project team photo`}
                canEdit={isAdmin}
                onUpload={handleImageUpload}
            />
            <h2 className="member-name">{name}</h2> 
            <p className="member-role">{role}</p>
        </div>
    );
}

export default MemberCard

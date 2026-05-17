import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faXmark } from "@fortawesome/free-solid-svg-icons";


import Navbar from '../../../components/navbar.jsx';
import ChangePasswordModal from "../../../components/navbarRoutes/profile/changePasswordModal.jsx";
import { authFetch, formatYearLevel, getCourseLabel, getPositionLabel, getStoredUser, setCookie } from "../../../components/export/utility.jsx";


import '../../../styles/profile/profile.css';

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const readStoredUser = () => {
    try {
        return getStoredUser();
    } catch {
        return null;
    }
};

const getInitials = (user) => {
    const firstInitial = user?.firstName?.trim()?.[0] || '';
    const lastInitial = user?.lastName?.trim()?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || 'U';
};


function Profile(){

    const [user, setUser] = useState(readStoredUser);
    const role = user?.role;
    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    const course = getCourseLabel(user?.course) || "N/A";
    const year = formatYearLevel(user?.year) || "N/A";
    const section = String(user?.section ?? '').trim().replace(/^section\s+/i, '') || "N/A";
    const position = getPositionLabel(user?.position) || "N/A";
    const avatarSrc = user?.profileImageUrl || '';
    const initials = getInitials(user);

    const [modalChangePassword, setModalChangePassword] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const handleChangePassword = () => {
        setModalChangePassword(true);
    }

    const handleAvatarFile = (file) => {
        if (!file) return;

        if (!PROFILE_IMAGE_TYPES.includes(file.type)) {
            toast.error('Profile photo must be JPG, PNG, WEBP, or GIF.');
            return;
        }

        if (file.size > MAX_PROFILE_IMAGE_SIZE) {
            toast.error('Profile photo must be 5 MB or smaller.');
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) {
            toast.error('Please select a profile photo.');
            return;
        }

        setUploadingAvatar(true);

        try {
            const formData = new FormData();
            formData.append('image', avatarFile);

            const response = await authFetch('/profile-picture', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile photo.');
            }

            const updatedUser = data.user ? {
                ...user,
                ...data.user,
                profileImageUrl: data.user.profileImageUrl || data.profileImageUrl || user?.profileImageUrl,
            } : {
                ...user,
                profileImageUrl: data.profileImageUrl,
            };

            setUser(updatedUser);
            setCookie('user', JSON.stringify(updatedUser), 1);
            setAvatarFile(null);
            setAvatarPreview('');
            if (fileInputRef.current) fileInputRef.current.value = '';
            toast.success(data.message || 'Profile photo updated.');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Could not upload profile photo.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const clearAvatarPreview = () => {
        setAvatarFile(null);
        setAvatarPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const renderAvatarUploader = () => (
        <div className="profile-avatar-panel">
            <div
                className={`profile-avatar-dropzone${isDraggingAvatar ? ' is-dragging' : ''}${uploadingAvatar ? ' is-uploading' : ''}`}
                role="button"
                tabIndex={0}
                aria-label="Upload profile photo"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingAvatar(true);
                }}
                onDragLeave={() => setIsDraggingAvatar(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingAvatar(false);
                    handleAvatarFile(e.dataTransfer.files?.[0]);
                }}
            >
                <input
                    ref={fileInputRef}
                    className="profile-avatar-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => handleAvatarFile(e.target.files?.[0])}
                />

                {avatarPreview || avatarSrc ? (
                    <img className="profile-avatar-image" src={avatarPreview || avatarSrc} alt="profile" />
                ) : (
                    <div className="profile-avatar-initials">{initials}</div>
                )}

                <span className="profile-avatar-camera">
                    <FontAwesomeIcon icon={faCamera} />
                </span>
            </div>

            {!avatarPreview && !avatarSrc && (
                <p className="profile-avatar-help">JPG, PNG, WEBP, GIF up to 5 MB</p>
            )}

            {avatarFile && (
                <div className="profile-avatar-actions">
                    <span className="profile-avatar-file">{avatarFile.name}</span>
                    <button
                        className="profile-avatar-icon-btn"
                        type="button"
                        aria-label="Remove selected photo"
                        onClick={clearAvatarPreview}
                        disabled={uploadingAvatar}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                    <button
                        className="profile-avatar-save-btn"
                        type="button"
                        onClick={handleAvatarUpload}
                        disabled={uploadingAvatar}
                    >
                        {uploadingAvatar ? 'Uploading...' : 'Save Photo'}
                    </button>
                </div>
            )}
        </div>
    );

    return(
        <>
            <Navbar/>

            <div className="profile-main-container">
                {(role === "systemAdmin" || role === "schoolFaculty")  && (
                    <>
                        <div className="profile-container-systemSchoolAdmin">
                            {renderAvatarUploader()}

                            <h1 className="profile-name-systemSchoolAdmin">{fullName || (role === "systemAdmin" ? "System Admin" : "School Faculty")}</h1>
                            <button 
                                className="update-btn-systemSchoolAdmin"
                                onClick={handleChangePassword}
                                >
                                    Change Password
                            </button>
                        </div>
                    </>
                )}

                {role === "studentOfficer"  && (
                    <>
                        <div className="profile-container">
                            {renderAvatarUploader()}

                            <h1 className="profile-name">{fullName}</h1>
                            <button 
                                className="update-btn-systemSchoolAdmin"
                                onClick={handleChangePassword}
                                >
                                    Change Password
                            </button>
                        </div>

                        <div className="profile-details">
                            <table className="profile-data">
                                <tbody className="profile-data-body">
                                    <tr className="profile-data-row">
                                        <td className="profile-data-info">Year Level</td>
                                        <td className="profile-data-info">{year}</td>
                                    </tr>
                                    <tr className="profile-data-row">
                                        <td className="profile-data-info">Course</td>
                                        <td className="profile-data-info">{course}</td>
                                    </tr>
                                    <tr className="profile-data-row">
                                        <td className="profile-data-info">Section</td>
                                        <td className="profile-data-info">{section}</td>
                                    </tr>
                                    <tr className="profile-data-row">
                                        <td className="profile-data-info">Student Officer</td>
                                        <td className="profile-data-info">{position}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {role === "teacherFaculty" && (
                    <>
                        <div className="profile-container-systemSchoolAdmin">
                            {renderAvatarUploader()}

                            <h1 className="profile-name-systemSchoolAdmin">{fullName}</h1>
                            <button 
                                className="update-btn-systemSchoolAdmin"
                                onClick={handleChangePassword}
                                >
                                    Change Password
                            </button>
                        </div>
                    </>
                )}
            </div>

            {modalChangePassword && (
                <ChangePasswordModal setModalChangePassword={setModalChangePassword} />
            )}
            
        </>
    );
}   

export default Profile

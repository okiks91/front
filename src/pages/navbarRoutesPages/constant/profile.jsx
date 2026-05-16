import React, { useState } from "react";


import Navbar from '../../../components/navbar.jsx';
import ChangePasswordModal from "../../../components/navbarRoutes/profile/changePasswordModal.jsx";
import ProfilePic from '../../../assets/images/pissinthewind.png';
import { formatSectionLabel, formatYearLevel, getCookie, getCourseLabel, getPositionLabel } from "../../../components/export/utility.jsx";


import '../../../styles/profile/profile.css';


function Profile(){

    const user = JSON.parse(getCookie("user"));
    const role = user?.role;
    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    const course = getCourseLabel(user?.course) || "N/A";
    const year = formatYearLevel(user?.year) || "N/A";
    const section = formatSectionLabel(user?.section) || "N/A";
    const position = getPositionLabel(user?.position) || "N/A";

    const [modalChangePassword, setModalChangePassword] = useState(false);

    const handleChangePassword = () => {
        setModalChangePassword(true);
    }

    return(
        <>
            <Navbar/>

            <div className="profile-main-container">
                {(role === "systemAdmin" || role === "schoolFaculty")  && (
                    <>
                        <div className="profile-container-systemSchoolAdmin">
                            <div className="profile-pic-container-systemSchoolAdmin">
                                <img className="profile-pic-systemSchoolAdmin" src={ProfilePic} alt="profile-pic"></img>
                            </div>

                            <h1 className="profile-name-systemSchoolAdmin">{fullName || (role === "systemAdmin" ? "System Admin" : "School Admin")}</h1>
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
                            <div className="profile-pic-container">
                                <img className="profile-pic" src={ProfilePic} alt="profile-pic"></img>
                            </div>

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
                            <div className="profile-pic-container-systemSchoolAdmin">
                                <img className="profile-pic-systemSchoolAdmin" src={ProfilePic} alt="profile-pic"></img>
                            </div>

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

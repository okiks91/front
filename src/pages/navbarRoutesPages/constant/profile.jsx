import React, { useState } from "react";


import Navbar from '../../../components/navbar.jsx';
import ChangePasswordModal from "../../../components/navbarRoutes/profile/changePasswordModal.jsx";
import ProfilePic from '../../../assets/images/pissinthewind.png';
import { getCookie } from "../../../components/export/utility.jsx";


import '../../../styles/profile/profile.css';


const courseLabels = {
    CpE: "BS Computer Engineering",
    ME: "BS Mechanical Engineering",
    CE: "BS Civil Engineering",
    IE: "BS Industrial Engineering",
    EE: "BS Electrical Engineering",
    ECE: "BS Electronics Engineering",
};

const positionLabels = {
    president: "President",
    vicePresident: "Vice President",
    secretary: "Secretary",
    treasurer: "Treasurer",
};

const yearLabels = {
    1: "1st Year",
    2: "2nd Year",
    3: "3rd Year",
    4: "4th Year",
};


function Profile(){

    const user = JSON.parse(getCookie("user"));
    const role = user?.role;
    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    const course = courseLabels[user?.course] ?? user?.course ?? "—";
    const year = yearLabels[user?.year] ?? (user?.year ? `Year ${user.year}` : "—");
    const position = positionLabels[user?.position] ?? user?.position ?? "—";

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

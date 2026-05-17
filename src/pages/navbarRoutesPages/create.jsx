import React, { useState } from "react";


import Navbar from '../../components/navbar.jsx';
import { registrationWhoData } from '../../components/export/constant.jsx';


import "../../styles/navbarRoutes/create.css";


function Create() {

    const [who, setWho] = useState("studentOfficer");
    const SelectedComponent = registrationWhoData.find(item => item.id === who)?.component;

    return(
        <>
            <Navbar/>

            <div className="create">
                <select
                    value={who}
                    onChange={(e) => setWho(e.target.value)}
                >
                    <option value="studentOfficer">Student Officer</option>
                    <option value="schoolFaculty">School Faculty</option>
                </select>
            </div>

            <div className="create-content">
                {SelectedComponent && <SelectedComponent />}
            </div>
        </>
    );
}

export default Create

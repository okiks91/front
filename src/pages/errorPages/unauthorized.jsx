import React from "react";
import { useNavigate } from "react-router-dom";


function Unauthorized() {

    const navigate = useNavigate();

    return (
        <div style={{ textAlign: "center", marginTop: "300px" }}>
            <h1>Unauthorized Access</h1>
            <p>You do not have permission to view this page.</p>

            <button style={{    border: "3px solid black",
                                borderRadius: "5px",
                                height: "60px",
                                width: "100px",
                                padding: "20px",
                                marginTop: "30px",
                                color: "white",
                                backgroundColor: "maroon" }}
                onClick={() => navigate(-1)}>
                Go Back
            </button>
        </div>
    );
}


export default Unauthorized
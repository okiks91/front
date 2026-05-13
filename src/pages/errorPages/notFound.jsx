import React from "react";
import { useNavigate } from "react-router-dom";


function NotFound() {

    const navigate = useNavigate();

    return (
        <div style={{ textAlign: "center", marginTop: "350px" }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>

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

export default NotFound
import { Navigate } from "react-router-dom";
import { getCookie } from './utility.jsx';


const ProtectedRoute = ({ children, allowedRoles }) => {
    const userCookie = getCookie("user");

    if (userCookie == null) { // !user
        return <Navigate to="/" replace/>;
    }

    let user;

    try {
        user = JSON.parse(userCookie);

        // for Debugging
        console.log("RAW COOKIE:", userCookie);
        console.log("PARSED USER:", user);
        console.log("USER ROLE:", user.role);
        console.log("ALLOWED ROLES:", allowedRoles);

    } catch {
        return <Navigate to="/" replace/>;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)){
        return <Navigate to ="/unauthorized" replace/>;
    }

    return children;
};

export default ProtectedRoute;
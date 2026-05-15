import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'


import { schoolUrl, navigationData } from '../components/export/constant.jsx';
import { getCookie, deleteCookie } from './export/utility.jsx';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faRightFromBracket,
    faBars,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import '../styles/navbarRoutes/navbar.css';


function Navbar(){

    const navigate = useNavigate();
    const [user, setUser] = useState();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const linkHandler = (event, navigateLink) => {
        event.preventDefault();
        navigate(navigateLink)
    }

    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? "active" : "";
    };

    const logoutHandler = () => {
        deleteCookie("user");
        deleteCookie("authToken");
        window.location.href ="/";
    }

    
    useEffect(() => {
        setUser(JSON.parse(getCookie("user")));
    }, [])

    return(
        <nav className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
             <FontAwesomeIcon onClick={() => setIsMenuOpen(!isMenuOpen)} className="icons menu-icon" icon={isMenuOpen ? faXmark : faBars} /> 
            <div className="logo-container">
                <a href='https://westmead-is.edu.ph/' target='_blank'><img className="sidebar-logo" src={schoolUrl}></img></a>
            </div>
            
            <div className='nav-links'>
                <ul>
                    {
                        navigationData.map((navData) => {
                            if (navData.role.includes(user?.role) || navData.role === 'all')
                                return (
                                    <li key={navData.path}>
                                        <a className={isActive(navData.path)} onClick={(event) => linkHandler(event, navData.path)}>
                                            <FontAwesomeIcon className="icons" icon={navData.iconName} /> 
                                            {navData.label}
                                        </a>
                                    </li>
                                )
                        })
                    }
                </ul>
            </div>

            <footer className='nav-footer2'>
                <button className="logout-btn" type='submit' onClick={logoutHandler}><FontAwesomeIcon icon={faRightFromBracket}/> LOG OUT</button>
            </footer>
        </nav>
    );
}

export default Navbar

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify';


import { schoolUrl, navigationData } from '../components/export/constant.jsx';
import { authFetch, getCookie, deleteCookie } from './export/utility.jsx';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faRightFromBracket,
    faBars,
    faXmark,
    faCamera,
} from "@fortawesome/free-solid-svg-icons";
import '../styles/navbarRoutes/navbar.css';

const MAX_LOGO_IMAGE_SIZE = 5 * 1024 * 1024;
const LOGO_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];


function Navbar(){

    const navigate = useNavigate();
    const [user, setUser] = useState();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState(schoolUrl);
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const logoInputRef = useRef(null);

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

    useEffect(() => {
        authFetch('/school-logo')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                const nextLogoUrl = data?.imageUrl || data?.logoUrl || data?.schoolLogoUrl;
                if (nextLogoUrl) setLogoUrl(nextLogoUrl);
            })
            .catch(err => console.error(err));
    }, []);

    const handleLogoUpload = async (file) => {
        if (!file || uploadingLogo) return;

        if (!LOGO_IMAGE_TYPES.includes(file.type)) {
            toast.error('Logo photo must be JPG, PNG, WEBP, or GIF.');
            return;
        }

        if (file.size > MAX_LOGO_IMAGE_SIZE) {
            toast.error('Logo photo must be 5 MB or smaller.');
            return;
        }

        setUploadingLogo(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await authFetch('/school-logo-image', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload logo photo.');
            }

            const nextLogoUrl = data.imageUrl || data.logoUrl || data.schoolLogoUrl;
            if (nextLogoUrl) setLogoUrl(nextLogoUrl);
            toast.success(data.message || 'Logo photo updated.');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Could not upload logo photo.');
        } finally {
            setUploadingLogo(false);
            setIsDraggingLogo(false);
            if (logoInputRef.current) logoInputRef.current.value = '';
        }
    };

    return(
        <nav className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
             <FontAwesomeIcon onClick={() => setIsMenuOpen(!isMenuOpen)} className="icons menu-icon" icon={isMenuOpen ? faXmark : faBars} /> 
            <div
                className={`logo-container${isDraggingLogo ? ' is-dragging' : ''}`}
                onDragOver={(e) => {
                    if (user?.role !== 'systemAdmin') return;
                    e.preventDefault();
                    setIsDraggingLogo(true);
                }}
                onDragLeave={() => setIsDraggingLogo(false)}
                onDrop={(e) => {
                    if (user?.role !== 'systemAdmin') return;
                    e.preventDefault();
                    handleLogoUpload(e.dataTransfer.files?.[0]);
                }}
            >
                <a href='https://westmead-is.edu.ph/' target='_blank'><img className="sidebar-logo" src={logoUrl} alt="school logo"></img></a>
                {user?.role === 'systemAdmin' && (
                    <>
                        <input
                            ref={logoInputRef}
                            className="sidebar-logo-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                        />
                        <button
                            className="sidebar-logo-upload-btn"
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={uploadingLogo}
                        >
                            <FontAwesomeIcon icon={faCamera} />
                            {uploadingLogo ? 'Uploading' : 'Add Photo'}
                        </button>
                    </>
                )}
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

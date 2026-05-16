// Icons
import { 
    faBuilding,
    faTools,
    faUser,
    faPlus,
    faTable,
    faClockRotateLeft,
    faCircleInfo,
    faUsers
} from "@fortawesome/free-solid-svg-icons";


// Create - Registrations
import RegisterStudent from "../navbarRoutes/create/registerStudent.jsx";
import RegisterSchoolAdmin from "../navbarRoutes/create/registerSchoolAdmin.jsx";
import schoolLogo from "../../assets/images/wisVer.png";


export const memberArray = [
    {
        imageUrl: "src/assets/images/charles.png",
        name: "Charles Rife",
        role: "Frontend Developer"
    },
    {
        imageUrl: "src/assets/images/charles.png",
        name: "John Francis Macaraig",
        role: "Backend Developer"
    },
    {
        imageUrl: "src/assets/images/charles.png",
        name: "Ela Mae Capistrano",
        role: "UI Design"
    },
    {
        imageUrl: "src/assets/images/charles.png",
        name: "Abby Saldua",
        role: "UI Design"
    },
    {
        imageUrl: "src/assets/images/charles.png",
        name: "Michelle Ricaforte",
        role: "Page Content"
    },
    {
        imageUrl: "src/assets/images/charles.png",
        name: "Marc Aron Del Mundo",
        role: "Database"
    },
    {
        imageUrl: "src/assets/images/charles.png",
        name: "Gascar De Chavez",
        role: "Responsive Design"
    },
    {
        imageUrl: "src/assets/images/charles.png",
        name: "Junel Aniban",
        role: "Navigation System"
    },
    {
        imageUrl: "src/assets/images/charles.png",
        name: "Joseph De Villa",
        role: "UI Interactivity"
    },
    {
        imageUrl: "src/assets/images/charles.png",
        name: "JB Compuesto",
        role: "Visual Design"
    },
    {
        imageUrl: "src/assets/images/charles.png",
        name: "Carl Jeric Rodriguez",
        role: "Content Quality"
    }
]


export const facilitiesArray = [
    {
        id: 'firstFloor',
        name: 'First Floor',
        data: [
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 101 - ME Lab"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 102 - EE Lab"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 103 - ECE Lab"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 104 - CE Lab"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 105 - IE Lab"
            }
        ] 
    },
    {
        id: 'secondFloor',
        name: 'Second Floor',
        data: [
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "CpE Lab"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 201"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 202"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 203"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 204"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Elisa Hall"
            }
        ] 
    },
    {
        id: 'thirdFloor',
        name: 'Third Floor',
        data: [
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 301"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 302"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 303"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 304"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 305"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 306"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 307"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 308"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "E-DRAW Room"
            }
        ] 
    },
    {
        id: 'fourthFloor',
        name: 'Fourth Floor',
        data: [
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Room 401"
            },
            {
                imageUrl: "src/assets/images/header.jpg",
                roomName: "Physics Lab"
            }
        ] 
    }
]


export const equipmentArray = [
    {
        imageUrl: "src/assets/images/pissinthewind.png",
        equipmentName: "Projector 1"
    },
    {
        imageUrl: "src/assets/images/pissinthewind.png",
        equipmentName: "Projector 2"
    },
    {
        imageUrl: "src/assets/images/pissinthewind.png",
        equipmentName: "Projector 3"
    },
    {
        imageUrl: "src/assets/images/pissinthewind.png",
        equipmentName: "Projector 4"
    },
    {
        imageUrl: "src/assets/images/pissinthewind.png",
        equipmentName: "Extension 1"
    },
    {
        imageUrl: "src/assets/images/pissinthewind.png",
        equipmentName: "Extension 2"
    }
]


export const schoolUrl = schoolLogo


export const navigationData = [
    {
        path: '/profile',
        iconName: faUser,
        label: 'PROFILE',
        role: 'all'
    },
    {
        path: '/create',
        iconName: faPlus,
        label: 'CREATE',
        role: 'systemAdmin'
    },
    {
        path: '/users',
        iconName: faUsers,
        label: 'USERS',
        role: 'systemAdmin'
    },
    {
        path: '/equipments',
        iconName: faTools,
        label: 'EQUIPMENT',
        role: 'schoolFaculty,studentOfficer,systemAdmin'
    },
    {
        path: '/facilities',
        iconName: faBuilding,
        label: 'FACILITIES',
        role: 'studentOfficer,systemAdmin'
    },
    {
        path: '/tables',
        iconName: faTable,
        label: 'TABLES',
        role: 'all'
    },
    {
        path: '/history',
        iconName: faClockRotateLeft,
        label: 'HISTORY',
        role: 'all'
    },
    {
        path: '/about',
        iconName: faCircleInfo,
        label: 'ABOUT',
        role: 'all'
    }
]


export const registrationWhoData = [
    {
        id: 'studentOfficer',
        who: 'Student Officer',
        component: RegisterStudent
    },
    {
        id: 'schoolFaculty',
        who: 'School Admin',
        component: RegisterSchoolAdmin
    }
]

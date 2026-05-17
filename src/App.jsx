/* 
    BrowserRouter: Enables routing using the browser URL
    Routes: Container for all route definitions
    Route: Defines a single route (path → component)
*/
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';


// Routes for Login
import Login from './pages/login.jsx';


// Routes for Error Pages
import Unauthorized from './pages/errorPages/unauthorized.jsx';
import NotFound from './pages/errorPages/notFound.jsx';


// NavbarRoutes for All Users 
import Profile from './pages/navbarRoutesPages/constant/profile.jsx';
import Tables from './pages/navbarRoutesPages/constant/tables.jsx';  
import History from './pages/navbarRoutesPages/constant/history.jsx'; 
import About from './pages/navbarRoutesPages/constant/about.jsx'; 


// Routes for System Admin
import Create from './pages/navbarRoutesPages/create.jsx';
import Users from './pages/navbarRoutesPages/users.jsx';


// Routes for 3 users
import Equipments from './pages/navbarRoutesPages/equipments.jsx';
import Facilities from './pages/navbarRoutesPages/facilities.jsx';


// Protected Route (handles authentication and role-based access)
import ProtectedRoute from './components/export/ProtectedRoute.jsx';


// Toastify for notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Routes for Global CSS
import './styles/global.css';


function App() {
    return(
        <BrowserRouter>
            <Routes>

                {/*Login*/}
                <Route path='/' element={<Navigate to="/login"/>}/>
                <Route path='/login' element={<Login/>}/>          

                {/*Unauthorized*/}
                <Route path='/unauthorized' element={<Unauthorized/>}/>

                {/*All NavbarRoutes - Constant*/}    
                <Route path='/profile' element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                <Route path='/tables' element={<ProtectedRoute><Tables/></ProtectedRoute>}/>
                <Route path='/history' element={<ProtectedRoute><History/></ProtectedRoute>}/>
                <Route path='/about' element={<ProtectedRoute><About/></ProtectedRoute>}/>


                {/* System Admin NavbarRoutes - Create*/}
                <Route 
                    path='/create' 
                    element={
                        <ProtectedRoute allowedRoles={['systemAdmin']}>
                            <Create/>
                        </ProtectedRoute>}>
                </Route>      

                <Route
                    path='/users'
                    element={
                        <ProtectedRoute allowedRoles={['systemAdmin']}>
                            <Users/>
                        </ProtectedRoute>}>
                </Route>


                {/*NavbarRoutes - Equipment & Facilities*/}
                <Route 
                    path='/equipments' 
                    element={
                        <ProtectedRoute allowedRoles={['schoolFaculty', 'studentOfficer', 'systemAdmin']}>
                            <Equipments/>
                        </ProtectedRoute>}>
                </Route>      
                
                <Route 
                    path='/facilities' 
                    element={
                        <ProtectedRoute allowedRoles={['studentOfficer', 'systemAdmin']}>
                            <Facilities/>
                        </ProtectedRoute>}>
                </Route>      

                {/* 404 */}
                <Route path="*" element={<NotFound/>}/>

            </Routes>

            <ToastContainer position="top-right" autoClose={3000}/>
            
        </BrowserRouter>
    );
}

export default App

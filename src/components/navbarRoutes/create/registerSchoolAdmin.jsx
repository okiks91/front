import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authFetch } from '../../export/utility.jsx';


import '../../../styles/login-register/registerSchoolAdmin.css';


function RegisterSchoolAdmin(){

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !email) {
            toast.error('Please fill in all fields.');
            return;
        }

        const trimmedEmail = email.trim();

        if (!trimmedEmail.includes('@')) {
            toast.error("Please enter a valid email address with '@'.");
            return;
        }

        setLoading(true);

        try {
            const response = await authFetch('/register-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email: trimmedEmail,
                    role: 'teacherFaculty',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Success! PIN sent to ${trimmedEmail}.`);
                setFirstName('');
                setLastName('');
                setEmail('');
            } else {
                toast.error(data.message || 'Registration failed.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className='registerSchoolAdmins-container'>
            <form className='register-schoolAdmin' onSubmit={handleRegister} noValidate>
                <div className="create"> 
                    <h1>Create an</h1>
                    <h2>School Faculty Account</h2>
                </div>

                <div className="form-schoolAdmin">
                    <div className="schoolAdminName">
                        <input className="schoolAdmin-credentials-name" type='text' placeholder='First Name' value={firstName} onChange={(e) => setFirstName(e.target.value)}></input>
                        <input className="schoolAdmin-credentials-name" type='text' placeholder='Last Name' value={lastName} onChange={(e) => setLastName(e.target.value)}></input>
                    </div><br/>

                    <input className="schoolAdmin-credentials" type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}></input><br/><br/>
                </div>

                <div className="registerSchoolAdmins-btns">
                    <button className="register" type='submit' disabled={loading}>
                        {loading ? 'REGISTERING...' : 'REGISTER'}
                    </button>
                </div>

            </form>
        </div>
    );

}

export default RegisterSchoolAdmin

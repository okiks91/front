import React, { useState } from 'react';


import '../../../styles/login-register/registerSchoolAdmin.css';


function RegisterSchoolAdmin(){

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleRegister = async () => {
        if (!firstName || !lastName || !email) {
            setMessage('Please fill in all fields.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:5000/register-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    role: 'teacherFaculty',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Success! PIN sent to ${email}.`);
                setFirstName('');
                setLastName('');
                setEmail('');
            } else {
                setMessage(data.message || 'Registration failed.');
            }
        } catch (error) {
            console.error(error);
            setMessage('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className='registerSchoolAdmins-container'>
            <form className='register-schoolAdmin' onSubmit={(e) => e.preventDefault()}>
                <div className="create"> 
                    <h1>Create an</h1>
                    <h2>School Admin Account</h2>
                </div>

                <div className="form-schoolAdmin">
                    <div className="schoolAdminName">
                        <input className="schoolAdmin-credentials-name" type='text' placeholder='First Name' value={firstName} onChange={(e) => setFirstName(e.target.value)}></input>
                        <input className="schoolAdmin-credentials-name" type='text' placeholder='Last Name' value={lastName} onChange={(e) => setLastName(e.target.value)}></input>
                    </div><br/>

                    <input className="schoolAdmin-credentials" type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}></input><br/><br/>
                </div>

                {message && <p style={{ color: message.startsWith('Success') ? 'green' : 'red', fontSize: '13px' }}>{message}</p>}

                <div className="registerSchoolAdmins-btns">
                    <button className="register" type='submit' onClick={handleRegister} disabled={loading}>
                        {loading ? 'REGISTERING...' : 'REGISTER'}
                    </button>
                </div>

            </form>
        </div>
    );

}

export default RegisterSchoolAdmin

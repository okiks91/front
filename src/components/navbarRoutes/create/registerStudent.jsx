import React, { useState } from 'react';


import '../../../styles/login-register/registerStudent.css';
import { apiUrl } from '../../export/api.jsx';


function RegisterStudent({}){

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [course, setCourse] = useState('');
    const [year, setYear] = useState('');
    const [position, setPosition] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleRegister = async () => {
        if (!firstName || !lastName || !course || !year || !position || !email) {
            setMessage('Please fill in all fields.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(apiUrl('/register-user'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    role: 'studentOfficer',
                    course,
                    year,
                    position,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Success! PIN sent to ${email}.`);
                setFirstName('');
                setLastName('');
                setCourse('');
                setYear('');
                setPosition('');
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
        <div className='registerStudent-container'>
            <form className='register-student' onSubmit={(e) => e.preventDefault()}>
                <div className="create"> 
                    <h1>Create an</h1>
                    <h2>Student Officer <br/>Account</h2>
                </div>

                <div className="form-student">
                    <div className='studentName'>
                        <input className="student-credentials-name" type='text' placeholder='First Name' value={firstName} onChange={(e) => setFirstName(e.target.value)}></input>
                        <input className="student-credentials-name" type='text' placeholder='Last Name' value={lastName} onChange={(e) => setLastName(e.target.value)}></input>
                    </div><br/>

                    <select className="student-credentials" value={course} onChange={(e) => setCourse(e.target.value)}>
                        <option value="">Select Course</option>
                        <option value="CpE">BS Computer Engineering</option>
                        <option value="ME">BS Mechanical Engineering</option>
                        <option value="CE">BS Civil Engineering</option>
                        <option value="IE">BS Industrial Engineering</option>
                        <option value="EE">BS Electrical Engineering</option>
                        <option value="ECE">BS Electronics Engineering</option>
                    </select><br/><br/>

                    <div className="oneline">
                        <input className="year-role" type='number' placeholder='Year' min={1} max={4} value={year} onChange={(e) => setYear(e.target.value)}></input><br/><br/>
                        <select className="year-role" value={position} onChange={(e) => setPosition(e.target.value)}>
                            <option value="">Select Role</option>
                            <option value="president">President</option>
                            <option value="vicePresident">V. President</option>
                            <option value="secretary">Secretary</option>
                            <option value="treasurer">Treasurer</option>
                        </select>
                    </div>

                    <input className="student-credentials" type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}></input><br/><br/>
                </div>

                {message && <p style={{ color: message.startsWith('Success') ? 'green' : 'red', fontSize: '13px' }}>{message}</p>}

                <div className="registerStudent-btns">
                    <button className="register" type='submit' onClick={handleRegister} disabled={loading}>
                        {loading ? 'REGISTERING...' : 'REGISTER'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default RegisterStudent

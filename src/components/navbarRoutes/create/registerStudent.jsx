import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authFetch } from '../../export/utility.jsx';


import '../../../styles/login-register/registerStudent.css';


function RegisterStudent(){

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [course, setCourse] = useState('');
    const [year, setYear] = useState('');
    const [position, setPosition] = useState('');
    const [section, setSection] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSectionChange = (e) => {
        setSection(e.target.value.replace(/[^A-Za-z0-9]/g, ''));
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !course || !year || !position || !section || !email) {
            toast.error('Please fill in all fields.');
            return;
        }

        const trimmedEmail = email.trim();
        const trimmedSection = section.trim();
        const numericYear = Number(year);

        if (!trimmedSection) {
            toast.error('Please enter a section.');
            return;
        }

        if (!/^[A-Za-z0-9]+$/.test(trimmedSection)) {
            toast.error('Section can only contain letters and numbers.');
            return;
        }

        if (!trimmedEmail.includes('@')) {
            toast.error("Please enter a valid email address with '@'.");
            return;
        }

        if (!Number.isInteger(numericYear) || numericYear < 1 || numericYear > 4) {
            toast.error('Year must be between 1 and 4.');
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
                    role: 'studentOfficer',
                    course,
                    year: numericYear,
                    position,
                    section: trimmedSection,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Success! PIN sent to ${trimmedEmail}.`);
                setFirstName('');
                setLastName('');
                setCourse('');
                setYear('');
                setPosition('');
                setSection('');
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
        <div className='registerStudent-container'>
            <form className='register-student' onSubmit={handleRegister} noValidate>
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
                        <input className="year-role" type='text' placeholder='Section' value={section} onChange={handleSectionChange} pattern="[A-Za-z0-9]*"></input>
                    </div>

                    <select className="student-credentials" value={position} onChange={(e) => setPosition(e.target.value)}>
                        <option value="">Select Role</option>
                        <option value="president">President</option>
                        <option value="vicePresident">V. President</option>
                        <option value="secretary">Secretary</option>
                        <option value="treasurer">Treasurer</option>
                    </select><br/><br/>

                    <input className="student-credentials" type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}></input><br/><br/>
                </div>

                <div className="registerStudent-btns">
                    <button className="register" type='submit' disabled={loading}>
                        {loading ? 'REGISTERING...' : 'REGISTER'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default RegisterStudent

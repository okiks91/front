import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { setCookie } from '../components/export/utility.jsx';
import '../styles/login-register/login.css';


function Login(){

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const loginHandler = async () => {
        const loginData = { email, password };

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            const data = await response.json();

            if (response.ok) {
                setCookie('user', JSON.stringify(data.user), 1);
                toast.success('Login successful!');
                setTimeout(() => navigate('/profile'), 1000);
            } else {
                toast.error(data.message || 'Invalid credentials.');
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error('Could not connect to server.');
        }
    };

    return(
        <div className='login-container'>
            <form className='form-login' onSubmit={(e) => e.preventDefault()}>
                <div className='greetings'>
                    <h1>Hello Westmedian,</h1>
                    <h2>Welcome !</h2>
                </div>
                <input className="credentials" type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email'></input><br/>
                <div className="password-wrapper">
                    <input
                        className="credentials"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Password'
                    ></input>
                    <button
                        type='button'
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12c0 0 4-8 10-8s10 8 10 8"></path>
                            <circle cx="12" cy="12" r="2.5"></circle>
                            {!showPassword && <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round"></line>}
                        </svg>
                    </button>
                </div><br/><br/>

                <button className="login-btn" type='submit' onClick={loginHandler}>LOGIN</button>
            </form>
        </div>
    );
}

export default Login

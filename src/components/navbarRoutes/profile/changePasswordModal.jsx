import React, { useState } from "react";
import { toast } from 'react-toastify';


import '../../../styles/profile/changePasswordModal.css';
import { authFetch, getCookie } from "../../export/utility.jsx";


function ChangePasswordModal({ setModalChangePassword }){

    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrentPin, setShowCurrentPin] = useState(false);
    const [showNewPin, setShowNewPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);

    const handleUpdate = async () => {
        if (!currentPin || !newPin || !confirmPin) {
            toast.error('Please fill in all fields.');
            return;
        }

        if (newPin !== confirmPin) {
            toast.error('New passwords do not match.');
            return;
        }

        if (newPin === currentPin) {
            toast.error('New password must be different from the current password.');
            return;
        }

        const user = JSON.parse(getCookie('user'));
        const email = user?.email;

        if (!email) {
            toast.error('Could not identify user. Please log in again.');
            return;
        }

        setLoading(true);

        try {
            const response = await authFetch('/change-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, currentPin, newPin }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password updated successfully.');
                setCurrentPin('');
                setNewPin('');
                setConfirmPin('');
            } else {
                toast.error(data.message || 'Update failed.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return(
        <>
            <div className="modal-overlay">
                <div className="changePassword-modal-container">
                    <form className="changePasswordForm" onSubmit={(e) => e.preventDefault()}>
                        <h1>Change Password</h1>

                        <div className="form-group">
                            <label className="cp-label" htmlFor="currentPassword">Current Password:</label>
                            <div className="password-wrapper-cp">
                                <input
                                    className="cp-input"
                                    type={showCurrentPin ? 'text' : 'password'}
                                    id="currentPassword"
                                    value={currentPin}
                                    onChange={(e) => setCurrentPin(e.target.value)}
                                    required
                                />
                                <button
                                    type='button'
                                    className="password-toggle-cp"
                                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M2 12c0 0 4-8 10-8s10 8 10 8"></path>
                                        <circle cx="12" cy="12" r="2.5"></circle>
                                        {!showCurrentPin && <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round"></line>}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="cp-label" htmlFor="newPassword">New Password:</label>
                            <div className="password-wrapper-cp">
                                <input
                                    className="cp-input"
                                    type={showNewPin ? 'text' : 'password'}
                                    id="newPassword"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value)}
                                    required
                                />
                                <button
                                    type='button'
                                    className="password-toggle-cp"
                                    onClick={() => setShowNewPin(!showNewPin)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M2 12c0 0 4-8 10-8s10 8 10 8"></path>
                                        <circle cx="12" cy="12" r="2.5"></circle>
                                        {!showNewPin && <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round"></line>}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="cp-label" htmlFor="confirmPassword">Confirm New Password:</label>
                            <div className="password-wrapper-cp">
                                <input
                                    className="cp-input"
                                    type={showConfirmPin ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value)}
                                    required
                                />
                                <button
                                    type='button'
                                    className="password-toggle-cp"
                                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M2 12c0 0 4-8 10-8s10 8 10 8"></path>
                                        <circle cx="12" cy="12" r="2.5"></circle>
                                        {!showConfirmPin && <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round"></line>}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="cp-btns-container">
                            <button
                                className="update-cp-btn"
                                type="button"
                                onClick={() => setModalChangePassword(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="update-cp-btn"
                                type="submit"
                                onClick={handleUpdate}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ChangePasswordModal

import React, { useState } from "react";

import { toast } from "react-toastify";
import { authFetch, getCookie, getCurrentTimeString, getLocalDateString } from "../../export/utility.jsx";
import '../../../styles/navbarRoutes/equipment/requestEquipmentModal.css';


function RequestEquipmentModal({ setModalType, equipmentName, onRequestSubmitted }){

    const today = getLocalDateString();
    const currentTime = getCurrentTimeString();

    const [date, setDate] = useState(today);
    const [startTime, setStartTime] = useState(currentTime);
    const [startTimeEdited, setStartTimeEdited] = useState(false);
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [loading, setLoading] = useState(false);

    const refreshDefaultStartTime = () => {
        if (date === getLocalDateString() && !startTimeEdited) {
            setStartTime(getCurrentTimeString());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const latestCurrentTime = getCurrentTimeString();
        if (date === getLocalDateString() && startTime < latestCurrentTime) {
            toast.error('Start time cannot be earlier than the current time.');
            return;
        }

        if (date === getLocalDateString() && endTime < latestCurrentTime) {
            toast.error('End time cannot be earlier than the current time.');
            return;
        }

        if (endTime <= startTime) {
            toast.error('End time must be later than the start time.');
            return;
        }

        setLoading(true);

        const user = JSON.parse(getCookie('user') || 'null');

        const courseLabels = {
            CpE: "BS Computer Engineering",
            ME: "BS Mechanical Engineering",
            CE: "BS Civil Engineering",
            IE: "BS Industrial Engineering",
            EE: "BS Electrical Engineering",
            ECE: "BS Electronics Engineering",
        };

        const positionLabels = {
            president: "President",
            vicePresident: "Vice President",
            secretary: "Secretary",
            treasurer: "Treasurer",
        };

        const requesterName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
        const course = courseLabels[user?.course] ?? user?.course ?? '';
        const year = user?.year ? `${user.year}${['st','nd','rd'][user.year - 1] || 'th'} Year` : '';
        const position = positionLabels[user?.position] ?? user?.position ?? '';
        const requesterDetails = [course, year, position].filter(Boolean).join(' - ');

        try {
            const response = await authFetch('/equipment-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    equipmentName,
                    requesterEmail: user?.email,
                    requesterName,
                    requesterDetails,
                    date,
                    startTime,
                    endTime,
                    purpose,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Request submitted successfully!");
                if (onRequestSubmitted) await onRequestSubmitted();
                setModalType(null);
            } else {
                toast.error(data.message || 'Request failed.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="equipment-request-modal-container">
                <form className="request-form" onSubmit={handleSubmit}>
                    <h1>Request Equipment</h1>
                    <h2 className="modal-item-name">{equipmentName}</h2>

                    <div className="form-group">
                        <label htmlFor="date" className="req-label">Date:</label>
                        <input id="date" className="req-input" type="date" value={date} min={today} onChange={e => {
                            const nextDate = e.target.value;
                            setDate(nextDate);
                            if (nextDate === getLocalDateString() && !startTimeEdited) {
                                setStartTime(getCurrentTimeString());
                            }
                        }} required/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="time-start" className="req-label">Start Time:</label>
                        <input
                            id="time-start"
                            className="req-input"
                            type="time"
                            value={startTime}
                            min={date === today ? getCurrentTimeString() : undefined}
                            onFocus={refreshDefaultStartTime}
                            onClick={refreshDefaultStartTime}
                            onChange={e => {
                                setStartTimeEdited(true);
                                setStartTime(e.target.value);
                            }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="time-end" className="req-label">End Time:</label>
                        <input
                            id="time-end"
                            className="req-input"
                            type="time"
                            value={endTime}
                            min={date === today && startTime < getCurrentTimeString() ? getCurrentTimeString() : startTime}
                            onChange={e => setEndTime(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="purpose" className="req-label">Purpose:</label>
                        <textarea
                            id="purpose"
                            className="req-input"
                            placeholder="Enter purpose..."
                            value={purpose}
                            onChange={e => setPurpose(e.target.value)}
                            required
                        />
                    </div>

                    <div className="req-btns-container">
                        <button
                            className="req-btns"
                            type="button"
                            onClick={() => setModalType(null)}
                        >
                            CANCEL
                        </button>

                        <button type="submit" className="req-btns" disabled={loading}>
                            {loading ? 'SUBMITTING...' : 'REQUEST'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RequestEquipmentModal

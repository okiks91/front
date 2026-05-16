import React, { useState } from "react";

import { toast } from "react-toastify";
import { authFetch, buildRequesterDetails, getCookie, getCurrentTimeString, getLocalDateString } from "../../export/utility.jsx";
import '../../../styles/navbarRoutes/equipment/requestEquipmentModal.css';


function RequestEquipmentModal({ setModalType, equipmentName, onRequestSubmitted }){

    const today = getLocalDateString();
    const currentTime = getCurrentTimeString();

    const [date, setDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
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

        if (endDate === getLocalDateString() && endTime < latestCurrentTime) {
            toast.error('End time cannot be earlier than the current time.');
            return;
        }

        if (endDate === date && endTime <= startTime) {
            toast.error('End time must be later than the start time when using the same date.');
            return;
        }

        setLoading(true);

        const user = JSON.parse(getCookie('user') || 'null');

        const requesterName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
        const requesterDetails = buildRequesterDetails(user);

        try {
            const response = await authFetch('/equipment-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    equipmentName,
                    requesterEmail: user?.email,
                    requesterName,
                    requesterDetails,
                    requesterCourse: user?.course,
                    requesterYear: user?.year,
                    requesterSection: user?.section,
                    requesterPosition: user?.position,
                    date,
                    endDate,
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
                        <label htmlFor="date" className="req-label">Start Date:</label>
                        <input id="date" className="req-input" type="date" value={date} min={today} onChange={e => {
                            const nextDate = e.target.value;
                            setDate(nextDate);
                            if (endDate < nextDate) {
                                setEndDate(nextDate);
                            }
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
                        <label htmlFor="end-date" className="req-label">End Date:</label>
                        <input
                            id="end-date"
                            className="req-input"
                            type="date"
                            value={endDate}
                            min={date}
                            onChange={e => setEndDate(e.target.value)}
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
                            min={endDate === date ? startTime : undefined}
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

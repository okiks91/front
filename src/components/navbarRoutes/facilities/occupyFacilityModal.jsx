import React, { useState } from "react";

import { toast } from "react-toastify";
import { authFetch, buildRequesterDetails, getCookie, getCurrentTimeString } from "../../export/utility.jsx";
import '../../../styles/navbarRoutes/equipment/requestEquipmentModal.css';


function OccupyFacilityModal({ setOccupyFacilityModal, roomName, floorName, onOccupied }){

    const currentTime = getCurrentTimeString();

    const [startTime, setStartTime] = useState(currentTime);
    const [startTimeEdited, setStartTimeEdited] = useState(false);
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);

    const refreshDefaultStartTime = () => {
        if (!startTimeEdited) {
            setStartTime(getCurrentTimeString());
        }
    };

    const handleConfirm = async (e) => {
        e.preventDefault();

        if (!startTime || !endTime) {
            toast.error('Please fill in both start and end time.');
            return;
        }

        const latestCurrentTime = getCurrentTimeString();
        if (startTime < latestCurrentTime) {
            toast.error('Start time cannot be earlier than the current time.');
            return;
        }

        if (endTime < latestCurrentTime) {
            toast.error('End time cannot be earlier than the current time.');
            return;
        }

        if (endTime <= startTime) {
            toast.error('End time must be later than the start time.');
            return;
        }

        setLoading(true);

        const user = JSON.parse(getCookie('user'));

        const requesterName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
        const requesterDetails = buildRequesterDetails(user);

        try {
            const response = await authFetch('/facility-occupy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName,
                    floorName,
                    requesterEmail: user?.email,
                    requesterName,
                    requesterDetails,
                    requesterCourse: user?.course,
                    requesterYear: user?.year,
                    requesterSection: user?.section,
                    requesterPosition: user?.position,
                    startTime,
                    endTime,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Facility occupied successfully!");
                if (onOccupied) onOccupied();
                setOccupyFacilityModal(false);
            } else {
                toast.error(data.message || 'Could not occupy facility.');
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
                <form className="request-form" onSubmit={handleConfirm}>
                    <h1>Occupy Facility</h1>
                    <h2 className="modal-item-name">
                        {roomName} — {floorName}
                    </h2>

                    <div className="form-group">
                        <label htmlFor="time-start" className="req-label">Start Time:</label>
                        <input
                            id="time-start"
                            className="req-input"
                            type="time"
                            value={startTime}
                            min={getCurrentTimeString()}
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
                            min={startTime < getCurrentTimeString() ? getCurrentTimeString() : startTime}
                            onChange={e => setEndTime(e.target.value)}
                            required
                        />
                    </div>

                    <div className="occupy-btns-container">
                        <button
                            className="occupy-btns"
                            type="button"
                            onClick={() => setOccupyFacilityModal(false)}
                        >
                            CANCEL
                        </button>
                        <button className="occupy-btns" type="submit" disabled={loading}>
                            {loading ? 'CONFIRMING...' : 'CONFIRM'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default OccupyFacilityModal

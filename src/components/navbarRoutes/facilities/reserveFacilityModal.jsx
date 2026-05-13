import React, { useState } from "react";

import { toast } from "react-toastify";
import '../../../styles/navbarRoutes/equipment/requestEquipmentModal.css';


function ReserveFacilityModal({ setReserveFacilityModal, roomName, floorName }){

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const [date, setDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [startTime, setStartTime] = useState(currentTime);
    const [endTime, setEndTime] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/facility-reserve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName,
                    floorName,
                    date,
                    endDate,
                    startTime,
                    endTime,
                    reason,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Facility reserved successfully!");
                setReserveFacilityModal(false);
            } else {
                toast.error(data.message || 'Failed to reserve facility.');
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
                    <h1>Reserve Facility</h1>
                    <h2 style={{ marginBottom: '12px', fontSize: '14px', color: '#555' }}>
                        {roomName} — {floorName}
                    </h2>

                    <div className="form-group">
                        <label htmlFor="date" className="req-label">Start Date:</label>
                        <input
                            id="date"
                            className="req-input"
                            type="date"
                            value={date}
                            min={today}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="time-start" className="req-label">Start Time:</label>
                        <input
                            id="time-start"
                            className="req-input"
                            type="time"
                            value={startTime}
                            min={currentTime}
                            onChange={e => setStartTime(e.target.value)}
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
                        <label htmlFor="reason" className="req-label">Reason:</label>
                        <textarea
                            id="reason"
                            className="req-input"
                            placeholder="Reason for Reservation"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            required
                        />
                    </div>

                    <div className="req-btns-container">
                        <button
                            className="req-btns"
                            type="button"
                            onClick={() => setReserveFacilityModal(false)}
                        >
                            CANCEL
                        </button>
                        <button className="req-btns" type="submit" disabled={loading}>
                            {loading ? 'SAVING...' : 'CONFIRM'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReserveFacilityModal

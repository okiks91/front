import React, { useState } from "react";

import { toast } from "react-toastify";
import { authFetch, getCurrentTimeString, getLocalDateString } from "../../export/utility.jsx";
import '../../../styles/navbarRoutes/equipment/requestEquipmentModal.css';


function ReserveEquipmentModal({ setModalType, equipmentName, onStatusChanged }){

    const today = getLocalDateString();
    const currentTime = getCurrentTimeString();

    const [date, setDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [startTime, setStartTime] = useState(currentTime);
    const [startTimeEdited, setStartTimeEdited] = useState(false);
    const [endTime, setEndTime] = useState('');
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState('Reserved');
    const [loading, setLoading] = useState(false);

    const refreshDefaultStartTime = () => {
        if (date === getLocalDateString() && !startTimeEdited) {
            setStartTime(getCurrentTimeString());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (status === 'Reserved') {
            const latestCurrentTime = getCurrentTimeString();
            if (date === getLocalDateString() && startTime < latestCurrentTime) {
                toast.error('Start time cannot be earlier than the current time.');
                return;
            }

            if (endDate === date && endTime <= startTime) {
                toast.error('End time must be later than the start time when using the same date.');
                return;
            }
        }

        setLoading(true);

        const isUnavailable = status === 'Unavailable';

        try {
            const response = await authFetch('/equipment-set-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    equipmentName,
                    date: isUnavailable ? today : date,
                    endDate: isUnavailable ? today : endDate,
                    startTime: isUnavailable ? null : startTime,
                    endTime: isUnavailable ? null : endTime,
                    reason,
                    status,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Equipment status set successfully!");
                if (onStatusChanged) await onStatusChanged();
                setModalType(null);
            } else {
                toast.error(data.message || 'Failed to set status.');
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
                    <h1>Set Equipment Status</h1>
                    <h2 className="modal-item-name">{equipmentName}</h2>

                    <div className="form-group">
                        <label htmlFor="status" className="req-label">Status:</label>
                        <select
                            id="status"
                            className="req-input"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            required
                        >
                            <option value="Reserved">Reserved</option>
                            <option value="Unavailable">Unavailable</option>
                        </select>
                    </div>

                    {status === 'Reserved' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="date" className="req-label">Start Date:</label>
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
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="end-date" className="req-label">End Date:</label>
                                <input id="end-date" className="req-input" type="date" value={endDate} min={date} onChange={e => setEndDate(e.target.value)} required/>
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
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="reason" className="req-label">Reason:</label>
                        <textarea
                            style={{ cursor: "text" }}
                            id="reason"
                            className="req-input"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
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

                        <button className="req-btns" type="submit" disabled={loading}>
                            {loading ? 'SAVING...' : 'CONFIRM'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReserveEquipmentModal

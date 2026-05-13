import React, { useState } from "react";

import { toast } from "react-toastify";
import '../../../styles/navbarRoutes/equipment/requestEquipmentModal.css';
import { apiUrl } from '../../export/api.jsx';


function ReserveEquipmentModal({ setModalType, equipmentName, onStatusChanged }){

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const [date, setDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [startTime, setStartTime] = useState(currentTime);
    const [endTime, setEndTime] = useState('');
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState('Reserved');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const isUnavailable = status === 'Unavailable';

        try {
            const response = await fetch(apiUrl('/equipment-set-status'), {
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
                                <input id="date" className="req-input" type="date" value={date} min={today} onChange={e => setDate(e.target.value)} required/>
                            </div>

                            <div className="form-group">
                                <label htmlFor="time-start" className="req-label">Start Time:</label>
                                <input id="time-start" className="req-input" type="time" value={startTime} min={currentTime} onChange={e => setStartTime(e.target.value)}/>
                            </div>

                            <div className="form-group">
                                <label htmlFor="end-date" className="req-label">End Date:</label>
                                <input id="end-date" className="req-input" type="date" value={endDate} min={date} onChange={e => setEndDate(e.target.value)} required/>
                            </div>

                            <div className="form-group">
                                <label htmlFor="time-end" className="req-label">End Time:</label>
                                <input id="time-end" className="req-input" type="time" value={endTime} min={endDate === date ? startTime : undefined} onChange={e => setEndTime(e.target.value)}/>
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

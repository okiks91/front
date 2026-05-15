import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';


import Navbar from '../../components/navbar.jsx';
import EquipmentCardWrapper from '../../components/navbarRoutes/equipment/equipmentCardWrapper.jsx';
import OverTimeModal from '../../components/export/OverTimeModal.jsx';
import { authFetch, getCookie, isBookingPastEnd } from '../../components/export/utility.jsx';


import '../../styles/navbarRoutes/equipment/equipments.css';


function Equipments(){

    const user = JSON.parse(getCookie("user"));
    const role = user?.role;

    const courseLabels = {
        CpE: "BS Computer Engineering", ME: "BS Mechanical Engineering",
        CE: "BS Civil Engineering", IE: "BS Industrial Engineering",
        EE: "BS Electrical Engineering", ECE: "BS Electronics Engineering",
    };
    const course = courseLabels[user?.course] ?? user?.course ?? '';
    const year = user?.year ? `${user.year}${['st','nd','rd'][user.year - 1] || 'th'} Year` : '';
    const userCourseYear = [course, year].filter(Boolean).join(' - ');

    const isVisible = (record) =>
        record.requesterEmail === user?.email ||
        (userCourseYear && record.requesterDetails?.startsWith(userCourseYear));

    const [pendingRequests, setPendingRequests] = useState([]);
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [equipmentStatuses, setEquipmentStatuses] = useState([]);
    const [loadingAction, setLoadingAction] = useState(null);
    const [overTimeItems, setOverTimeItems] = useState([]);
    const [showOverTimeModal, setShowOverTimeModal] = useState(false);
    const autoEndTimers = useRef({});

    const checkOvertime = (approved) => {
        const overdue = approved.filter(r => isVisible(r) && isBookingPastEnd(r));
        if (overdue.length > 0) {
            setOverTimeItems(overdue.map(r => ({ name: r.equipmentName, endTime: r.endTime, id: r.id })));
            setShowOverTimeModal(true);
            overdue.forEach(r => {
                if (!autoEndTimers.current[r.id]) {
                    autoEndTimers.current[r.id] = setTimeout(() => {
                        authFetch(`/equipment-request/${r.id}/mark-available`, { method: 'POST' })
                            .then(() => fetchAll())
                            .catch(console.error);
                        delete autoEndTimers.current[r.id];
                    }, 5 * 60 * 1000);
                }
            });
        }
    };

    const fetchAll = useCallback(async () => {
        try {
            const [pendingRes, approvedRes, statusesRes] = await Promise.all([
                authFetch('/equipment-requests?status=pending'),
                authFetch('/equipment-requests?status=approved'),
                authFetch('/equipment-statuses'),
            ]);

            if (pendingRes.ok) setPendingRequests(await pendingRes.json());
            if (approvedRes.ok) { const data = await approvedRes.json(); setApprovedRequests(data); checkOvertime(data); }
            if (statusesRes.ok) setEquipmentStatuses(await statusesRes.json());
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }, []);

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, role === 'systemAdmin' ? 5000 : 60000);
        return () => clearInterval(interval);
    }, [role, fetchAll]);

    const handleApprove = async (id) => {
        setLoadingAction(id + '-approve');
        try {
            const response = await authFetch(`/equipment-request/${id}/approve`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to approve request.');
            toast.success('Equipment request approved.');
            await fetchAll();
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Failed to approve request.');
        }
        setLoadingAction(null);
    };

    const handleDecline = async (id) => {
        setLoadingAction(id + '-decline');
        try {
            const response = await authFetch(`/equipment-request/${id}/decline`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to decline request.');
            toast.success('Equipment request declined.');
            await fetchAll();
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Failed to decline request.');
        }
        setLoadingAction(null);
    };

    const handleMarkAvailable = async (id) => {
        setLoadingAction(id + '-available');
        try {
            const response = await authFetch(`/equipment-request/${id}/mark-available`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to mark equipment available.');
            toast.success('Equipment marked available.');
            await fetchAll();
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Failed to mark equipment available.');
        }
        setLoadingAction(null);
    };

    const handleRemoveStatus = async (id) => {
        setLoadingAction(id + '-remove');
        try {
            const response = await authFetch(`/equipment-status/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to remove equipment status.');
            toast.success('Equipment status removed.');
            await fetchAll();
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Failed to remove equipment status.');
        }
        setLoadingAction(null);
    };

    const formatTime = (t) => {
        if (!t) return '—';
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const display = hour % 12 || 12;
        return `${display}:${m} ${ampm}`;
    };

    return(
        <>
            <Navbar/>
        
            <main className='equipment-content'>
                <section className='equipmentRequest-card-wrapper'>
                    <EquipmentCardWrapper equipmentStatuses={equipmentStatuses} onStatusChanged={fetchAll}/>
                </section>

                {role === "studentOfficer" && (
                    <section className='equipmentRequest-table-container'>
                        <h1>Currently Used Equipment</h1>
                        <hr/>
                        <table className="equipment-table">
                            <thead className='equipment-table-header'>
                                <tr>
                                    <th>EQUIPMENT</th>
                                    <th>NAME</th>
                                    <th>START-TIME</th>
                                    <th>END-TIME</th>
                                </tr>
                            </thead>
                            <tbody className='equipment-table-body'>
                                {approvedRequests.filter(isVisible).length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                                            No equipment currently in use.
                                        </td>
                                    </tr>
                                ) : approvedRequests.filter(isVisible).map((req) => (
                                    <tr key={req.id}>
                                        <td>{req.equipmentName}</td>
                                        <td>{req.requesterName}</td>
                                        <td>{formatTime(req.startTime)}</td>
                                        <td>{formatTime(req.endTime)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {role === "systemAdmin" && (
                    <>
                        {/* ── Pending Requests ── */}
                        <section className='equipmentRequest-table-container'>
                            <h1>Equipment Request Table</h1>  
                            <hr/> 
                            <table className="equipment-table">
                                <thead className='equipment-table-header'>
                                    <tr>
                                        <th>No.</th>
                                        <th>EQUIPMENT</th>
                                        <th>NAME</th>
                                        <th>DETAILS</th>
                                        <th>START-TIME</th>
                                        <th>END-TIME</th>
                                        <th>PURPOSE</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>  
                                <tbody className='equipment-table-body'>
                                    {pendingRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                                                No pending requests.
                                            </td>
                                        </tr>
                                    ) : pendingRequests.map((req, index) => (
                                        <tr key={req.id}>
                                            <td>{index + 1}</td>
                                            <td>{req.equipmentName}</td>
                                            <td>{req.requesterName}</td>
                                            <td>{req.requesterDetails}</td>
                                            <td>{formatTime(req.startTime)}</td>
                                            <td>{formatTime(req.endTime)}</td>
                                            <td>{req.purpose}</td>
                                            <td>
                                                <div>
                                                    <button
                                                        className='approve-in-use-btn'
                                                        onClick={() => handleApprove(req.id)}
                                                        disabled={!!loadingAction}
                                                    >
                                                        {loadingAction === req.id + '-approve' ? '...' : 'Approve'}
                                                    </button>
                                                    <br/><br/>
                                                    <button
                                                        className='in-use-btn'
                                                        onClick={() => handleDecline(req.id)}
                                                        disabled={!!loadingAction}
                                                    >
                                                        {loadingAction === req.id + '-decline' ? '...' : 'Decline'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>

                        {/* ── Currently In Use (Approved) ── */}
                        <section className='equipmentRequest-table-container'>
                            <h1>Equipment Currently Used by Others</h1>  
                            <hr/> 
                            <table className="equipment-table">
                                <thead className='equipment-table-header'>
                                    <tr>
                                        <th>No.</th>
                                        <th>EQUIPMENT</th>
                                        <th>NAME</th>
                                        <th>DETAILS</th>
                                        <th>START-TIME</th>
                                        <th>END-TIME</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>  
                                <tbody className='equipment-table-body'>
                                    {approvedRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                                                No equipment currently in use.
                                            </td>
                                        </tr>
                                    ) : approvedRequests.map((req, index) => (
                                        <tr key={req.id}>
                                            <td>{index + 1}</td>
                                            <td>{req.equipmentName}</td>
                                            <td>{req.requesterName}</td>
                                            <td>{req.requesterDetails}</td>
                                            <td>{formatTime(req.startTime)}</td>
                                            <td>{formatTime(req.endTime)}</td>
                                            <td>
                                                <button
                                                    className='available-in-use-btn'
                                                    onClick={() => handleMarkAvailable(req.id)}
                                                    disabled={!!loadingAction}
                                                >
                                                    {loadingAction === req.id + '-available' ? '...' : 'Available'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>

                        {/* ── Reserved / Unavailable ── */}
                        <section className='equipmentRequest-table-container'>
                            <h1>Equipment Currently Not Available</h1>  
                            <hr/> 
                            <table className="equipment-table">
                                <thead className='equipment-table-header'>
                                    <tr>
                                        <th>No.</th>
                                        <th>EQUIPMENT</th>
                                        <th>STATUS</th>
                                        <th>REASON</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>  
                                <tbody className='equipment-table-body'>
                                    {equipmentStatuses.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                                                All equipment available.
                                            </td>
                                        </tr>
                                    ) : equipmentStatuses.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.equipmentName}</td>
                                            <td>{item.status}</td>
                                            <td>{item.reason}</td>
                                            <td>
                                                <button
                                                    className='available-in-use-btn'
                                                    onClick={() => handleRemoveStatus(item.id)}
                                                    disabled={!!loadingAction}
                                                >
                                                    {loadingAction === item.id + '-remove' ? '...' : 'Available'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </>
                )}
            </main>

            <footer className='equipment-footer'>
                <h1>REMINDER!</h1>
                <p>To the person who is responsible for maintaining the equipments, please ensure that all equipment are properly maintained and that any issues are reported immediately.</p>
            </footer>

            {showOverTimeModal && (
                <OverTimeModal
                    items={overTimeItems}
                    onClose={() => setShowOverTimeModal(false)}
                />
            )}
        </>
    );
}

export default Equipments

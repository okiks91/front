import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';


import Navbar from '../../components/navbar.jsx';
import EquipmentCardWrapper from '../../components/navbarRoutes/equipment/equipmentCardWrapper.jsx';
import OverTimeModal from '../../components/export/OverTimeModal.jsx';
import {
    authFetch,
    formatSectionLabel,
    formatTimeRange,
    formatYearLevel,
    getCourseLabel,
    getStoredUser,
    getRequesterDetails,
    getRequesterSection,
    isBookingPastEnd,
    subscribeToRealtimeSnapshots,
} from '../../components/export/utility.jsx';


import '../../styles/navbarRoutes/equipment/equipments.css';

const readArrayResponse = async (response, keys = []) => {
    const data = await response.json();
    if (Array.isArray(data)) return data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }

    return [];
};

const readEquipmentItemsResponse = async (response) => {
    const data = await response.json();
    if (Array.isArray(data)) {
        return { items: data, deletedEquipmentNames: [] };
    }

    const items = ['equipmentItems', 'items', 'data'].find(key => Array.isArray(data?.[key]));
    const deletedEquipmentNames = data?.deletedEquipmentNames || data?.hiddenEquipmentNames || data?.deletedNames || [];

    return {
        items: items ? data[items] : [],
        deletedEquipmentNames: Array.isArray(deletedEquipmentNames) ? deletedEquipmentNames : [],
    };
};


function Equipments(){

    const user = getStoredUser();
    const role = user?.role;
    const canRequestEquipment = role === "studentOfficer" || role === "schoolFaculty";

    const course = getCourseLabel(user?.course);
    const year = formatYearLevel(user?.year);
    const section = formatSectionLabel(user?.section);
    const userCourseYear = [course, year].filter(Boolean).join(' - ');
    const userCourseYearSection = [course, year, section].filter(Boolean).join(' - ');

    const isVisible = useCallback((record) =>
        record.requesterEmail === user?.email ||
        (userCourseYearSection && record.requesterDetails?.startsWith(userCourseYearSection)) ||
        (!record.requesterSection && userCourseYear && record.requesterDetails?.startsWith(userCourseYear)),
        [user?.email, userCourseYear, userCourseYearSection]);

    const [pendingRequests, setPendingRequests] = useState([]);
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [equipmentItems, setEquipmentItems] = useState([]);
    const [deletedEquipmentNames, setDeletedEquipmentNames] = useState([]);
    const [equipmentStatuses, setEquipmentStatuses] = useState([]);
    const [fetchError, setFetchError] = useState('');
    const [loadingAction, setLoadingAction] = useState(null);
    const [overTimeItems, setOverTimeItems] = useState([]);
    const [showOverTimeModal, setShowOverTimeModal] = useState(false);
    const autoEndTimers = useRef({});
    const fetchAllRef = useRef(null);

    const checkOvertime = useCallback((approved) => {
        const overdue = approved.filter(r => isVisible(r) && isBookingPastEnd(r));
        if (overdue.length > 0) {
            setOverTimeItems(overdue.map(r => ({ name: r.equipmentName, endTime: r.endTime, id: r.id })));
            setShowOverTimeModal(true);
            overdue.forEach(r => {
                if (!autoEndTimers.current[r.id]) {
                    autoEndTimers.current[r.id] = setTimeout(() => {
                        authFetch(`/equipment-request/${r.id}/mark-available`, { method: 'POST' })
                            .then(() => fetchAllRef.current?.())
                            .catch(console.error);
                        delete autoEndTimers.current[r.id];
                    }, 5 * 60 * 1000);
                }
            });
        }
    }, [isVisible]);

    const fetchEquipmentItems = useCallback(async () => {
        try {
            const response = await authFetch('/equipment-items');

            if (!response.ok) {
                throw new Error('Could not load equipment items.');
            }

            const itemsData = await readEquipmentItemsResponse(response);
            setEquipmentItems(itemsData.items);
            setDeletedEquipmentNames(itemsData.deletedEquipmentNames);
        } catch (error) {
            console.error('Equipment items fetch error:', error);
        }
    }, []);

    const fetchAll = useCallback(async () => {
        try {
            const [pendingRes, approvedRes, statusesRes] = await Promise.all([
                authFetch('/equipment-requests?status=pending'),
                authFetch('/equipment-requests?status=approved'),
                authFetch('/equipment-statuses'),
            ]);

            if (!pendingRes.ok || !approvedRes.ok || !statusesRes.ok) {
                throw new Error('Could not load equipment request data.');
            }

            const pendingData = await readArrayResponse(pendingRes, ['requests', 'equipmentRequests', 'pendingRequests', 'data']);
            const approvedData = await readArrayResponse(approvedRes, ['requests', 'equipmentRequests', 'approvedRequests', 'data']);
            const statusesData = await readArrayResponse(statusesRes, ['statuses', 'equipmentStatuses', 'data']);

            setPendingRequests(pendingData);
            setApprovedRequests(approvedData);
            setEquipmentStatuses(statusesData);
            setFetchError('');
            checkOvertime(approvedData);
        } catch (error) {
            console.error('Fetch error:', error);
            setFetchError(error.message || 'Could not load equipment request data.');
        }
    }, [checkOvertime]);

    fetchAllRef.current = fetchAll;

    const refreshEquipmentPage = useCallback(() => {
        fetchAll();
        fetchEquipmentItems();
    }, [fetchAll, fetchEquipmentItems]);

    const applyEquipmentSnapshot = useCallback((equipment = {}) => {
        const pendingData = Array.isArray(equipment.pendingRequests) ? equipment.pendingRequests : [];
        const approvedData = Array.isArray(equipment.approvedRequests) ? equipment.approvedRequests : [];
        const statusesData = Array.isArray(equipment.statuses) ? equipment.statuses : [];

        setPendingRequests(pendingData);
        setApprovedRequests(approvedData);
        setEquipmentStatuses(statusesData);
        setFetchError('');
        checkOvertime(approvedData);
    }, [checkOvertime]);

    useEffect(() => {
        const initialFetch = setTimeout(refreshEquipmentPage, 0);
        const unsubscribe = subscribeToRealtimeSnapshots({
            onSnapshot: (snapshot) => applyEquipmentSnapshot(snapshot?.equipment),
            onError: refreshEquipmentPage,
        });

        return () => {
            clearTimeout(initialFetch);
            unsubscribe();
        };
    }, [applyEquipmentSnapshot, refreshEquipmentPage]);

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

    const formatDateRange = (startDate, endDate) => {
        if (!startDate && !endDate) return '-';
        if (!endDate || startDate === endDate) return startDate || endDate;
        return `${startDate} - ${endDate}`;
    };

    return(
        <>
            <Navbar/>
        
            <main className='equipment-content'>
                <section className='equipmentRequest-card-wrapper'>
                    <EquipmentCardWrapper
                        equipmentItems={equipmentItems}
                        deletedEquipmentNames={deletedEquipmentNames}
                        equipmentStatuses={equipmentStatuses}
                        onEquipmentAdded={fetchEquipmentItems}
                        onStatusChanged={fetchAll}
                    />
                </section>

                {fetchError && (
                    <section className='equipmentRequest-table-container'>
                        <h1>Equipment Requests</h1>
                        <hr/>
                        <p style={{ padding: '16px 0', color: 'maroon' }}>{fetchError}</p>
                    </section>
                )}

                {canRequestEquipment && (
                    <section className='equipmentRequest-table-container'>
                        <h1>Currently Used Equipment</h1>
                        <hr/>
                        <table className="equipment-table">
                            <thead className='equipment-table-header'>
                                <tr>
                                    <th>EQUIPMENT</th>
                                    <th>NAME</th>
                                    <th>SECTION</th>
                                    <th>DATE</th>
                                    <th>TIME</th>
                                </tr>
                            </thead>
                            <tbody className='equipment-table-body'>
                                {approvedRequests.filter(isVisible).length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                                            No equipment currently in use.
                                        </td>
                                    </tr>
                                ) : approvedRequests.filter(isVisible).map((req) => (
                                    <tr key={req.id}>
                                        <td>{req.equipmentName}</td>
                                        <td>{req.requesterName}</td>
                                        <td>{getRequesterSection(req)}</td>
                                        <td>{formatDateRange(req.date, req.endDate)}</td>
                                        <td>{formatTimeRange(req.startTime, req.endTime)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {canRequestEquipment && (
                    <section className='equipmentRequest-table-container'>
                        <h1>My Pending Equipment Requests</h1>
                        <hr/>
                        <table className="equipment-table">
                            <thead className='equipment-table-header'>
                                <tr>
                                    <th>EQUIPMENT</th>
                                    <th>DATE</th>
                                    <th>TIME</th>
                                    <th>PURPOSE</th>
                                </tr>
                            </thead>
                            <tbody className='equipment-table-body'>
                                {pendingRequests.filter(isVisible).length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                                            No pending requests.
                                        </td>
                                    </tr>
                                ) : pendingRequests.filter(isVisible).map((req) => (
                                    <tr key={req.id}>
                                        <td>{req.equipmentName}</td>
                                        <td>{formatDateRange(req.date, req.endDate)}</td>
                                        <td>{formatTimeRange(req.startTime, req.endTime)}</td>
                                        <td>{req.purpose}</td>
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
                                        <th>SECTION</th>
                                        <th>DATE</th>
                                        <th>TIME</th>
                                        <th>PURPOSE</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>  
                                <tbody className='equipment-table-body'>
                                    {pendingRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                                                No pending requests.
                                            </td>
                                        </tr>
                                    ) : pendingRequests.map((req, index) => (
                                        <tr key={req.id}>
                                            <td>{index + 1}</td>
                                            <td>{req.equipmentName}</td>
                                            <td>{req.requesterName}</td>
                                            <td>{getRequesterDetails(req)}</td>
                                            <td>{getRequesterSection(req)}</td>
                                            <td>{formatDateRange(req.date, req.endDate)}</td>
                                            <td>{formatTimeRange(req.startTime, req.endTime)}</td>
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
                                        <th>SECTION</th>
                                        <th>DATE</th>
                                        <th>TIME</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>  
                                <tbody className='equipment-table-body'>
                                    {approvedRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                                                No equipment currently in use.
                                            </td>
                                        </tr>
                                    ) : approvedRequests.map((req, index) => (
                                        <tr key={req.id}>
                                            <td>{index + 1}</td>
                                            <td>{req.equipmentName}</td>
                                            <td>{req.requesterName}</td>
                                            <td>{getRequesterDetails(req)}</td>
                                            <td>{getRequesterSection(req)}</td>
                                            <td>{formatDateRange(req.date, req.endDate)}</td>
                                            <td>{formatTimeRange(req.startTime, req.endTime)}</td>
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
                                        <th>SECTION</th>
                                        <th>DATE</th>
                                        <th>TIME</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>  
                                <tbody className='equipment-table-body'>
                                    {equipmentStatuses.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                                                All equipment available.
                                            </td>
                                        </tr>
                                    ) : equipmentStatuses.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.equipmentName}</td>
                                            <td>{item.status}</td>
                                            <td>{item.reason}</td>
                                            <td>{formatSectionLabel(item.requesterSection) || '-'}</td>
                                            <td>{formatDateRange(item.date, item.endDate)}</td>
                                            <td>{formatTimeRange(item.startTime, item.endTime)}</td>
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

import React, { useState, useEffect, useCallback } from "react";


import Navbar from '../../../components/navbar.jsx';
import { authFetch, formatTimeRange, getRequesterDetails, getRequesterSection, subscribeToRealtimeSnapshots } from '../../../components/export/utility.jsx';


import '../../../styles/navbarRoutes/tables.css';

const readArrayResponse = async (response, keys = [], fallbackMessage = 'Could not load table data.') => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || fallbackMessage);
    }

    if (Array.isArray(data)) return data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }

    return [];
};

const fetchTableList = async (url, keys, fallbackMessage) => {
    try {
        const response = await authFetch(url);
        return {
            data: await readArrayResponse(response, keys, fallbackMessage),
            error: '',
        };
    } catch (error) {
        console.error(error);
        return {
            data: [],
            error: error.message || fallbackMessage,
        };
    }
};

const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return '-';

    const displayStartDate = startDate || endDate;
    const displayEndDate = endDate || startDate;

    if (displayStartDate === displayEndDate) return displayStartDate;
    return `${displayStartDate} - ${displayEndDate}`;
};

const formatSectionValue = (record) => {
    const section = getRequesterSection(record);
    if (!section || section === '-') return '-';
    return section.replace(/^section\s+/i, '');
};

const formatDetailsValue = (details) => {
    return String(details || '-').replace(/\bSection\s+([^-]*?)(?=\s*-|$)/gi, (_, section) => section.trim());
};

const renderTableMessage = (message, colSpan) => (
    <tr>
        <td colSpan={colSpan} style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
            {message}
        </td>
    </tr>
);


function Tables() {

    const [table, setTable] = useState("equipment");
    const [equipmentRequests, setEquipmentRequests] = useState([]);
    const [equipmentStatuses, setEquipmentStatuses] = useState([]);
    const [facilityOccupancies, setFacilityOccupancies] = useState([]);
    const [facilityReservations, setFacilityReservations] = useState([]);
    const [tableErrors, setTableErrors] = useState({});

    const fetchAll = useCallback(async () => {
        const [
            equipmentRequestsResult,
            equipmentStatusesResult,
            facilityOccupanciesResult,
            facilityReservationsResult,
        ] = await Promise.all([
            fetchTableList('/equipment-requests?status=approved&scope=all', ['requests', 'equipmentRequests', 'approvedRequests', 'data'], 'Could not load active equipment requests.'),
            fetchTableList('/equipment-statuses?scope=all', ['statuses', 'equipmentStatuses', 'data'], 'Could not load equipment statuses.'),
            fetchTableList('/facility-occupancies?scope=all', ['occupancies', 'facilityOccupancies', 'data'], 'Could not load active facility occupancies.'),
            fetchTableList('/facility-reservations?scope=all', ['reservations', 'facilityReservations', 'data'], 'Could not load facility reservations.'),
        ]);

        if (!equipmentRequestsResult.error) setEquipmentRequests(equipmentRequestsResult.data);
        if (!equipmentStatusesResult.error) setEquipmentStatuses(equipmentStatusesResult.data);
        if (!facilityOccupanciesResult.error) setFacilityOccupancies(facilityOccupanciesResult.data);
        if (!facilityReservationsResult.error) setFacilityReservations(facilityReservationsResult.data);

        setTableErrors({
            equipmentRequests: equipmentRequestsResult.error,
            equipmentStatuses: equipmentStatusesResult.error,
            facilityOccupancies: facilityOccupanciesResult.error,
            facilityReservations: facilityReservationsResult.error,
        });
    }, []);

    const applyTablesSnapshot = useCallback((tables = {}) => {
        setEquipmentRequests(Array.isArray(tables.equipmentRequests) ? tables.equipmentRequests : []);
        setEquipmentStatuses(Array.isArray(tables.equipmentStatuses) ? tables.equipmentStatuses : []);
        setFacilityOccupancies(Array.isArray(tables.facilityOccupancies) ? tables.facilityOccupancies : []);
        setFacilityReservations(Array.isArray(tables.facilityReservations) ? tables.facilityReservations : []);
        setTableErrors({});
    }, []);

    useEffect(() => {
        const initialFetch = setTimeout(fetchAll, 0);
        const unsubscribe = subscribeToRealtimeSnapshots({
            onSnapshot: (snapshot) => applyTablesSnapshot(snapshot?.tables),
            onError: fetchAll,
        });

        return () => {
            clearTimeout(initialFetch);
            unsubscribe();
        };
    }, [applyTablesSnapshot, fetchAll]);

    const sortByDateTimeDesc = (a, b) => {
        const dateCompare = (b.date || '').localeCompare(a.date || '');
        if (dateCompare !== 0) return dateCompare;

        return (b.startTime || '').localeCompare(a.startTime || '');
    };

    const equipmentRows = [
        ...equipmentRequests.map(r => ({
            id: r.id,
            type: 'equipment-request',
            equipment: r.equipmentName,
            name: r.requesterName,
            details: formatDetailsValue(getRequesterDetails(r)),
            section: formatSectionValue(r),
            date: r.date,
            endDate: r.endDate || r.date,
            startTime: r.startTime,
            endTime: r.endTime,
            status: 'In Use',
        })),
        ...equipmentStatuses.map(s => ({
            id: s.id,
            type: 'equipment-status',
            equipment: s.equipmentName,
            name: 'System Admin',
            details: formatDetailsValue(s.reason),
            section: String(s.requesterSection ?? '').trim().replace(/^section\s+/i, '') || '-',
            date: s.date,
            endDate: s.endDate || s.date,
            startTime: s.startTime || 'n/a',
            endTime: s.endTime || 'n/a',
            status: s.status,
        })),
    ].sort(sortByDateTimeDesc);

    const facilityRows = [
        ...facilityOccupancies.map(o => ({
            id: o.id,
            type: 'facility-occupancy',
            floorName: o.floorName,
            roomName: o.roomName,
            name: o.requesterName,
            details: formatDetailsValue(getRequesterDetails(o)),
            section: formatSectionValue(o),
            date: o.date,
            endDate: o.endDate || o.date,
            startTime: o.startTime,
            endTime: o.endTime,
            status: 'Occupied',
        })),
        ...facilityReservations.map(r => ({
            id: r.id,
            type: 'facility-reservation',
            floorName: r.floorName,
            roomName: r.roomName,
            name: 'System Admin',
            details: formatDetailsValue(r.reason),
            section: String(r.requesterSection ?? '').trim().replace(/^section\s+/i, '') || '-',
            date: r.date,
            endDate: r.endDate || r.date,
            startTime: r.startTime,
            endTime: r.endTime,
            status: 'Reserved',
        })),
    ].sort(sortByDateTimeDesc);

    const equipmentErrors = [tableErrors.equipmentRequests, tableErrors.equipmentStatuses].filter(Boolean);
    const facilityErrors = [tableErrors.facilityOccupancies, tableErrors.facilityReservations].filter(Boolean);

    return(
        <>
            <Navbar/>

            <header className="table-select">
                <select
                    value={table}
                    onChange={(e) => setTable(e.target.value)}>

                    <option value="equipment">Equipment</option>
                    <option value="facility">Facilities</option>
                </select>
            </header>
            
            <div className="whole-container tables-whole-container">

                {table === "equipment" && (            
                    <div className="table-equipment-main-container">
                        <section className='equipment-table-container'>
                            <h1>Equipment Data Table</h1>  
                            {equipmentErrors.map(error => (
                                <p key={error} style={{ padding: '8px 0', color: 'maroon' }}>{error}</p>
                            ))}
                            <hr/> 
                            <table className='equipment-table'>   
                                <thead className='equipment-table-header'>
                                    <tr>
                                        <th>No.</th>
                                        <th>EQUIPMENT</th>
                                        <th>NAME</th>
                                        <th>DETAILS</th>
                                        <th>SECTION</th>
                                        <th>DATE</th>
                                        <th>TIME</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>  
                                <tbody className='equipment-table-body'>
                                    {equipmentRows.length === 0 ? renderTableMessage('No equipment currently in use.', 8) : equipmentRows.map((row, index) => (
                                        <tr key={`${row.type}-${row.id}`}>
                                            <td>{index + 1}</td>
                                            <td>{row.equipment}</td>
                                            <td>{row.name}</td>
                                            <td>{row.details}</td>
                                            <td>{row.section}</td>
                                            <td>{formatDateRange(row.date, row.endDate)}</td>
                                            <td>{formatTimeRange(row.startTime, row.endTime)}</td>
                                            <td>{row.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>  
                    </div>
                )}

                {table === "facility" && (
                    <div className="table-facility-main-container">
                        <section className='facility-table-container'>
                            <h1>Facilities Data Table</h1>  
                            {facilityErrors.map(error => (
                                <p key={error} style={{ padding: '8px 0', color: 'maroon' }}>{error}</p>
                            ))}
                            <hr/> 
                            <table className='facilities-table'>   
                                <thead className='facilities-table-header'>
                                    <tr>
                                        <th>No.</th>
                                        <th>FLOOR No.</th>
                                        <th>FACILITY NAME</th>
                                        <th>NAME</th>
                                        <th>DETAILS</th>
                                        <th>SECTION</th>
                                        <th>DATE</th>
                                        <th>TIME</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>  
                                <tbody className='facilities-table-body'>
                                    {facilityRows.length === 0 ? renderTableMessage('No facilities currently in use.', 9) : facilityRows.map((row, index) => (
                                        <tr key={`${row.type}-${row.id}`}>
                                            <td>{index + 1}</td>
                                            <td>{row.floorName}</td>
                                            <td>{row.roomName}</td>
                                            <td>{row.name}</td>
                                            <td>{row.details}</td>
                                            <td>{row.section}</td>
                                            <td>{formatDateRange(row.date, row.endDate)}</td>
                                            <td>{formatTimeRange(row.startTime, row.endTime)}</td>
                                            <td>{row.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </div>
                )}
            </div>
        </>
    )
}

export default Tables;

import React, { useState, useEffect } from "react";


import Navbar from '../../../components/navbar.jsx';
import { authFetch, formatSectionLabel, getRequesterDetails, getRequesterSection } from '../../../components/export/utility.jsx';


import '../../../styles/navbarRoutes/tables.css';

const readArrayResponse = async (response, keys = []) => {
    if (!response.ok) throw new Error('Could not load table data.');

    const data = await response.json();
    if (Array.isArray(data)) return data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }

    return [];
};

const formatTime = (time) => {
    if (!time || time === 'n/a') return '-';

    const [hours, minutes = '00'] = String(time).split(':');
    const hour = Number(hours);

    if (Number.isNaN(hour)) return time;

    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
};

const formatTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return '-';
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
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


function Tables() {

    const [table, setTable] = useState("equipment");
    const [equipmentRequests, setEquipmentRequests] = useState([]);
    const [equipmentStatuses, setEquipmentStatuses] = useState([]);
    const [facilityOccupancies, setFacilityOccupancies] = useState([]);
    const [facilityReservations, setFacilityReservations] = useState([]);

    const fetchAll = async () => {
        try {
            const [equipmentRequestsRes, equipmentStatusesRes, facilityOccupanciesRes, facilityReservationsRes] = await Promise.all([
                authFetch('/equipment-requests?status=approved&scope=all'),
                authFetch('/equipment-statuses?scope=all'),
                authFetch('/facility-occupancies?scope=all'),
                authFetch('/facility-reservations?scope=all'),
            ]);

            const [equipmentRequestsData, equipmentStatusesData, facilityOccupanciesData, facilityReservationsData] = await Promise.all([
                readArrayResponse(equipmentRequestsRes, ['requests', 'equipmentRequests', 'approvedRequests', 'data']),
                readArrayResponse(equipmentStatusesRes, ['statuses', 'equipmentStatuses', 'data']),
                readArrayResponse(facilityOccupanciesRes, ['occupancies', 'facilityOccupancies', 'data']),
                readArrayResponse(facilityReservationsRes, ['reservations', 'facilityReservations', 'data']),
            ]);

            setEquipmentRequests(equipmentRequestsData);
            setEquipmentStatuses(equipmentStatusesData);
            setFacilityOccupancies(facilityOccupanciesData);
            setFacilityReservations(facilityReservationsData);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 5000);
        return () => clearInterval(interval);
    }, []);

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
            
            <div className="whole-container">

                {table === "equipment" && (            
                    <div className="table-equipment-main-container">
                        <section className='equipment-table-container'>
                            <h1>Equipment Data Table</h1>  
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
                                    {equipmentRows.map((row, index) => (
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
                                    {facilityRows.map((row, index) => (
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

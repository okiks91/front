import React, { useState, useEffect } from "react";


import Navbar from '../../../components/navbar.jsx';
import { authFetch } from '../../../components/export/utility.jsx';


import '../../../styles/navbarRoutes/tables.css';


function Tables() {

    const [table, setTable] = useState("equipment");
    const [equipmentRequests, setEquipmentRequests] = useState([]);
    const [equipmentStatuses, setEquipmentStatuses] = useState([]);
    const [facilityOccupancies, setFacilityOccupancies] = useState([]);
    const [facilityReservations, setFacilityReservations] = useState([]);

    const fetchAll = () => {
        authFetch('/equipment-requests?status=approved')
            .then(res => res.json()).then(data => setEquipmentRequests(data)).catch(console.error);
        authFetch('/equipment-statuses')
            .then(res => res.json()).then(data => setEquipmentStatuses(data)).catch(console.error);
        authFetch('/facility-occupancies')
            .then(res => res.json()).then(data => setFacilityOccupancies(data)).catch(console.error);
        authFetch('/facility-reservations')
            .then(res => res.json()).then(data => setFacilityReservations(data)).catch(console.error);
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
            equipment: r.equipmentName,
            name: r.requesterName,
            details: r.requesterDetails,
            date: r.date,
            startTime: r.startTime,
            endTime: r.endTime,
            status: 'In Use',
        })),
        ...equipmentStatuses.map(s => ({
            id: s.id,
            equipment: s.equipmentName,
            name: 'System Admin',
            details: s.reason,
            date: s.date,
            startTime: s.startTime || 'n/a',
            endTime: s.endTime || 'n/a',
            status: s.status,
        })),
    ].sort(sortByDateTimeDesc);

    const facilityRows = [
        ...facilityOccupancies.map(o => ({
            id: o.id,
            floorName: o.floorName,
            roomName: o.roomName,
            name: o.requesterName,
            details: o.requesterDetails,
            date: o.date,
            endDate: o.endDate || o.date,
            startTime: o.startTime,
            endTime: o.endTime,
            status: 'Occupied',
        })),
        ...facilityReservations.map(r => ({
            id: r.id,
            floorName: r.floorName,
            roomName: r.roomName,
            name: 'System Admin',
            details: r.reason,
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
                                        <th>DATE</th>
                                        <th>START-TIME</th>
                                        <th>END-TIME</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>  
                                <tbody className='equipment-table-body'>
                                    {equipmentRows.map((row, index) => (
                                        <tr key={row.id}>
                                            <td>{index + 1}</td>
                                            <td>{row.equipment}</td>
                                            <td>{row.name}</td>
                                            <td>{row.details}</td>
                                            <td>{row.date}</td>
                                            <td>{row.startTime}</td>
                                            <td>{row.endTime}</td>
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
                                        <th>START-DATE</th>
                                        <th>END-DATE</th>
                                        <th>START-TIME</th>
                                        <th>END-TIME</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>  
                                <tbody className='facilities-table-body'>
                                    {facilityRows.map((row, index) => (
                                        <tr key={row.id}>
                                            <td>{index + 1}</td>
                                            <td>{row.floorName}</td>
                                            <td>{row.roomName}</td>
                                            <td>{row.name}</td>
                                            <td>{row.details}</td>
                                            <td>{row.date}</td>
                                            <td>{row.endDate}</td>
                                            <td>{row.startTime}</td>
                                            <td>{row.endTime}</td>
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

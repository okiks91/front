import React, { useState, useEffect, useCallback } from "react";


import Navbar from '../../../components/navbar.jsx';
import { authFetch, formatTime, getRequesterDetails, getRequesterSection, subscribeToRealtimeSnapshots } from '../../../components/export/utility.jsx';


import '../../../styles/navbarRoutes/history.css';

const readArrayResponse = async (response, keys = [], fallbackMessage = 'Could not load history.') => {
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

const fetchHistoryList = async (url, keys, fallbackMessage) => {
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

const sortHistoryRows = (history) => {
    return [...history].sort((a, b) =>
        new Date(b.date || 0) - new Date(a.date || 0) ||
        (b.startTime || '').localeCompare(a.startTime || '')
    );
};

const renderTableMessage = (message, colSpan) => (
    <tr>
        <td colSpan={colSpan} style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
            {message}
        </td>
    </tr>
);


function History() {

    const [tableHistory, setTableHistory] = useState("equipmentHistory");
    const [equipmentHistory, setEquipmentHistory] = useState([]);
    const [facilityHistory, setFacilityHistory] = useState([]);
    const [historyErrors, setHistoryErrors] = useState({});

    const fetchHistory = useCallback(async () => {
        const [equipmentResult, facilityResult] = await Promise.all([
            fetchHistoryList('/equipment-history', ['history', 'equipmentHistory', 'data'], 'Could not load equipment history.'),
            fetchHistoryList('/facility-history', ['history', 'facilityHistory', 'data'], 'Could not load facility history.'),
        ]);

        if (!equipmentResult.error) setEquipmentHistory(equipmentResult.data);
        if (!facilityResult.error) setFacilityHistory(facilityResult.data);

        setHistoryErrors({
            equipment: equipmentResult.error,
            facility: facilityResult.error,
        });
    }, []);

    const applyHistorySnapshot = useCallback((history = {}) => {
        setEquipmentHistory(Array.isArray(history.equipment) ? history.equipment : []);
        setFacilityHistory(Array.isArray(history.facilities) ? history.facilities : []);
        setHistoryErrors({});
    }, []);

    useEffect(() => {
        const initialFetch = setTimeout(fetchHistory, 0);
        const unsubscribe = subscribeToRealtimeSnapshots({
            onSnapshot: (snapshot) => applyHistorySnapshot(snapshot?.history),
            onError: fetchHistory,
        });

        return () => {
            clearTimeout(initialFetch);
            unsubscribe();
        };
    }, [applyHistorySnapshot, fetchHistory]);

    const sortedEquipmentHistory = sortHistoryRows(equipmentHistory);
    const sortedFacilityHistory = sortHistoryRows(facilityHistory);
    
    return(
        <>
            <Navbar/>

            <header className="tableHistory-select">
                <select
                    value={tableHistory}
                    onChange={(e) => setTableHistory(e.target.value)}>

                    <option value="equipmentHistory">Equipment</option>
                    <option value="facilityHistory">Facilities</option>
                </select>
            </header>
            
            <div className="whole-container history-whole-container">
                {tableHistory === "equipmentHistory" && (            
                    <div className="tableHistory-equipment-main-container">
                        <section className='equipment-tableHistory-container'>
                            <h1>Equipment Data Table</h1>  
                            <hr/> 
                            <table className='equipment-tableHistory'>   
                                <thead className='equipment-tableHistory-header'>
                                    <tr>
                                        <th>No.</th>
                                        <th>DATE</th>
                                        <th>EQUIPMENT</th>
                                        <th>NAME</th>
                                        <th>DETAILS</th>
                                        <th>SECTION</th>
                                        <th>START-TIME</th>
                                        <th>END-TIME</th>
                                        <th>REMARKS</th>
                                    </tr>
                                </thead>  
                                <tbody className='equipment-tableHistory-body'>
                                    {historyErrors.equipment ? renderTableMessage(historyErrors.equipment, 9) : (
                                        sortedEquipmentHistory.length === 0 ? renderTableMessage('No equipment history found.', 9) :
                                        sortedEquipmentHistory.map((r, index) => (
                                        <tr key={r.id}>
                                            <td>{index + 1}</td>
                                            <td>{r.date}</td>
                                            <td>{r.equipmentName}</td>
                                            <td>{r.requesterName}</td>
                                            <td>{getRequesterDetails(r)}</td>
                                            <td>{getRequesterSection(r)}</td>
                                            <td>{formatTime(r.startTime)}</td>
                                            <td>{formatTime(r.endTime)}</td>
                                            <td>Returned</td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </section>  
                    </div>
                )}

                {tableHistory === "facilityHistory" && (
                    <div className="tableHistory-facility-main-container">
                        <section className='facility-tableHistory-container'>
                            <h1>Facilities Data Table</h1>  
                            <hr/> 
                            <table className='facilities-tableHistory'>   
                                <thead className='facilities-tableHistory-header'>
                                    <tr>
                                        <th>No.</th>
                                        <th>DATE</th>
                                        <th>FLOOR No.</th>
                                        <th>FACILITY NAME</th>
                                        <th>NAME</th>
                                        <th>DETAILS</th>
                                        <th>SECTION</th>
                                        <th>START-TIME</th>
                                        <th>END-TIME</th>
                                        <th>REMARKS</th>
                                    </tr>
                                </thead>  
                                <tbody className='facilities-tableHistory-body'>
                                    {historyErrors.facility ? renderTableMessage(historyErrors.facility, 10) : (
                                        sortedFacilityHistory.length === 0 ? renderTableMessage('No facility history found.', 10) :
                                        sortedFacilityHistory.map((r, index) => (
                                        <tr key={r.id}>
                                            <td>{index + 1}</td>
                                            <td>{r.date}</td>
                                            <td>{r.floorName}</td>
                                            <td>{r.roomName}</td>
                                            <td>{r.requesterName}</td>
                                            <td>{getRequesterDetails(r)}</td>
                                            <td>{getRequesterSection(r)}</td>
                                            <td>{formatTime(r.startTime)}</td>
                                            <td>{formatTime(r.endTime)}</td>
                                            <td>Finished</td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </section>
                    </div>
                )}
            </div>
        </>
    )
}

export default History

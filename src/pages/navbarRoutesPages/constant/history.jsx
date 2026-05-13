import React, { useState, useEffect } from "react";


import Navbar from '../../../components/navbar.jsx';


import '../../../styles/navbarRoutes/history.css';
import { apiUrl } from '../../../components/export/api.jsx';


function History() {

    const [tableHistory, setTableHistory] = useState("equipmentHistory");
    const [equipmentHistory, setEquipmentHistory] = useState([]);
    const [facilityHistory, setFacilityHistory] = useState([]);

    const fetchHistory = () => {
        fetch(apiUrl('/equipment-history'))
            .then(res => res.json()).then(data => setEquipmentHistory(data)).catch(console.error);
        fetch(apiUrl('/facility-history'))
            .then(res => res.json()).then(data => setFacilityHistory(data)).catch(console.error);
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, []);
    
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
            
            <div className="whole-container">
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
                                        <th>START-TIME</th>
                                        <th>END-TIME</th>
                                        <th>REMARKS</th>
                                    </tr>
                                </thead>  
                                <tbody className='equipment-tableHistory-body'>
                                    {[...equipmentHistory].sort((a, b) => new Date(b.date) - new Date(a.date) || b.startTime.localeCompare(a.startTime)).map((r, index) => (
                                        <tr key={r.id}>
                                            <td>{index + 1}</td>
                                            <td>{r.date}</td>
                                            <td>{r.equipmentName}</td>
                                            <td>{r.requesterName}</td>
                                            <td>{r.requesterDetails}</td>
                                            <td>{r.startTime}</td>
                                            <td>{r.endTime}</td>
                                            <td>Returned</td>
                                        </tr>
                                    ))}
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
                                        <th>START-TIME</th>
                                        <th>END-TIME</th>
                                        <th>REMARKS</th>
                                    </tr>
                                </thead>  
                                <tbody className='facilities-tableHistory-body'>
                                    {[...facilityHistory].sort((a, b) => new Date(b.date) - new Date(a.date) || b.startTime.localeCompare(a.startTime)).map((r, index) => (
                                        <tr key={r.id}>
                                            <td>{index + 1}</td>
                                            <td>{r.date}</td>
                                            <td>{r.floorName}</td>
                                            <td>{r.roomName}</td>
                                            <td>{r.requesterName}</td>
                                            <td>{r.requesterDetails}</td>
                                            <td>{r.startTime}</td>
                                            <td>{r.endTime}</td>
                                            <td>Finished</td>
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

export default History
import React, { useState, useEffect, useRef } from 'react';


import Navbar from '../../components/navbar.jsx';
import FacilityCardWrapper from '../../components/navbarRoutes/facilities/facilityCardWrapper.jsx';
import EndOccupyFacilityModal from '../../components/navbarRoutes/facilities/endOccupyFacilityModal.jsx';
import OverTimeModal from '../../components/export/OverTimeModal.jsx';
import { facilitiesArray }  from '../../components/export/constant.jsx';
import { getCookie } from '../../components/export/utility.jsx';


import '../../styles/navbarRoutes/facilities/facility.css';


function Facilities(){

    const user = JSON.parse(getCookie("user") || 'null');
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
    const [floor, setFloor] = useState(facilitiesArray[0].id);
    const [showEndOccupyFacilityModal, setEndOccupyFacilityModal] = useState(false);
    const [selectedOccupancy, setSelectedOccupancy] = useState(null);
    const [occupancies, setOccupancies] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [overTimeItems, setOverTimeItems] = useState([]);
    const [showOverTimeModal, setShowOverTimeModal] = useState(false);
    const autoEndTimers = useRef({});
    const fetchOccupanciesRef = useRef(null);

    const getCurrentTime = () => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    };

    const dismissedRef = useRef(new Set());

    const checkOvertime = (data) => {
        const now = getCurrentTime();
        const overdue = data.filter(o => isVisible(o) && o.endTime && now > o.endTime);
        if (overdue.length > 0) {
            const newOverdue = overdue.filter(o => !dismissedRef.current.has(o.id) && !autoEndTimers.current[o.id + '-end']);
            if (newOverdue.length > 0) {
                setOverTimeItems(newOverdue.map(o => ({ name: o.roomName, endTime: o.endTime, id: o.id })));
                setShowOverTimeModal(true);
                newOverdue.forEach(o => {
                    autoEndTimers.current[o.id + '-end'] = setTimeout(() => {
                        fetch(`http://localhost:5000/facility-occupancy/${o.id}/end`, { method: 'POST' })
                            .then(() => {
                                setOverTimeItems([{ name: o.roomName, endTime: o.endTime, id: o.id, ended: true }]);
                                setShowOverTimeModal(true);
                                if (fetchOccupanciesRef.current) fetchOccupanciesRef.current();
                            })
                            .catch(console.error);
                        delete autoEndTimers.current[o.id + '-end'];
                    }, 5 * 60 * 1000);
                });
            }
        }
    };

    const fetchOccupancies = () => {
        fetch('http://localhost:5000/facility-occupancies')
            .then(res => res.json())
            .then(data => {
                setOccupancies(data);
                checkOvertime(data);

                data.filter(o => isVisible(o) && o.endTime).forEach(o => {
                    if (autoEndTimers.current[o.id + '-notify'] || dismissedRef.current.has(o.id)) return;
                    const now = new Date();
                    const [h, m] = o.endTime.split(':').map(Number);
                    const endDate = new Date();
                    endDate.setHours(h, m, 0, 0);
                    const msUntilEnd = endDate - now;
                    if (msUntilEnd > 0) {
                        autoEndTimers.current[o.id + '-notify'] = setTimeout(() => {
                            if (dismissedRef.current.has(o.id)) return;
                            setOverTimeItems(prev => {
                                const already = prev.find(x => x.id === o.id);
                                if (already) return prev;
                                return [...prev, { name: o.roomName, endTime: o.endTime, id: o.id }];
                            });
                            setShowOverTimeModal(true);
                            autoEndTimers.current[o.id + '-end'] = setTimeout(() => {
                                fetch(`http://localhost:5000/facility-occupancy/${o.id}/end`, { method: 'POST' })
                                    .then(() => {
                                        setOverTimeItems([{ name: o.roomName, endTime: o.endTime, id: o.id, ended: true }]);
                                        setShowOverTimeModal(true);
                                        if (fetchOccupanciesRef.current) fetchOccupanciesRef.current();
                                    })
                                    .catch(console.error);
                                delete autoEndTimers.current[o.id + '-end'];
                                delete autoEndTimers.current[o.id + '-notify'];
                            }, 5 * 60 * 1000);
                        }, msUntilEnd);
                    }
                });
            })
            .catch(err => console.error(err));
    };

    fetchOccupanciesRef.current = fetchOccupancies;

    const fetchReservations = () => {
        fetch('http://localhost:5000/facility-reservations')
            .then(res => res.json())
            .then(data => setReservations(data))
            .catch(err => console.error(err));
    };

    const handleMarkAvailable = async (id) => {
        try {
            await fetch(`http://localhost:5000/facility-reservation/${id}`, { method: 'DELETE' });
            fetchReservations();
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (role === 'studentOfficer') {
            fetchOccupancies();
            const interval = setInterval(fetchOccupancies, 60000);
            return () => clearInterval(interval);
        }
        if (role === 'systemAdmin') {
            fetchReservations();
            const interval = setInterval(fetchReservations, 5000);
            return () => clearInterval(interval);
        }
    }, []);

    const handleEndOccupyFacilityClick = (occupancy) => {
        setSelectedOccupancy(occupancy);
        setEndOccupyFacilityModal(true);
    };

    return(
        <>
            <Navbar/>
            
            <header className="facilities">
                <select 
                    value={floor} 
                    onChange={(e) => setFloor(e.target.value)}>
                    {facilitiesArray.map((floor) => (
                        <option key={floor.id} value={floor.id}>{floor.name}</option>
                    ))}
                </select>
            </header>

            <main className='facility-content'>
                <section className='facility-card-wrapper'>
                    <FacilityCardWrapper floorValue={floor} onOccupied={fetchOccupancies}/>
                </section>

                {role === "studentOfficer"  && (
                    <section className='equipmentRequest-table-container'>
                        <h1>Currently Used Facility</h1>  
                        <hr/> 
                        <table className="equipment-table">

                            <thead className='equipment-table-header'>
                                <tr>
                                    <th>FLOOR No.</th>
                                    <th>FACILITY NAME</th>
                                    <th>START-TIME</th>
                                    <th>END-TIME</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>  
                            <tbody className='equipment-table-body'>
                                {occupancies.filter(isVisible).map((o) => (
                                    <tr key={o.id}>
                                        <td>{o.floorName}</td>
                                        <td>{o.roomName}</td>
                                        <td>{o.startTime}</td>
                                        <td>{o.endTime}</td>
                                        <td>
                                            {o.requesterEmail === user?.email ? (
                                                <button
                                                    className='in-use-btn'
                                                    onClick={() => handleEndOccupyFacilityClick(o)}
                                                >
                                                    END
                                                </button>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}
                {role === "systemAdmin"  && (
                    <section className='equipmentRequest-table-container'>
                        <h1>Currently Reserved Facility</h1>  
                        <hr/> 
                        <table className="equipment-table">

                            <thead className='equipment-table-header'>
                                <tr>
                                    <th>No.</th>
                                    <th>FLOOR No.</th>
                                    <th>FACILITY NAME</th>
                                    <th>DETAILS</th>
                                    <th>START-DATE</th>
                                    <th>END-DATE</th>
                                    <th>START-TIME</th>
                                    <th>END-TIME</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>  
                            <tbody className='equipment-table-body'>
                                {reservations.map((r, index) => (
                                    <tr key={r.id}>
                                        <td>{index + 1}</td>
                                        <td>{r.floorName}</td>
                                        <td>{r.roomName}</td>
                                        <td>
                                            <div>{r.reason}</div>
                                        </td>
                                        <td>{r.date}</td>
                                        <td>{r.endDate || r.date}</td>
                                        <td>{r.startTime}</td>
                                        <td>{r.endTime}</td>
                                        <td>
                                            <button className='available-in-use-btn' onClick={() => handleMarkAvailable(r.id)}>Available</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}
            </main>

            <footer className='facility-footer'>
                <h1>REMINDER!</h1>
                <p>To the person who is responsible for maintaining the facilities, please ensure that all facilities are properly maintained and that any issues are reported immediately.</p>
            </footer>

            {showOverTimeModal && (
                <OverTimeModal
                    items={overTimeItems}
                    onClose={() => {
                        overTimeItems.forEach(o => dismissedRef.current.add(o.id));
                        setShowOverTimeModal(false);
                        setOverTimeItems([]);
                    }}
                />
            )}

            {showEndOccupyFacilityModal && (
                <EndOccupyFacilityModal
                    setEndOccupyFacilityModal={setEndOccupyFacilityModal}
                    occupancyId={selectedOccupancy?.id}
                    onEnded={fetchOccupancies}
                />
            )}
        </>
    );
}

export default Facilities

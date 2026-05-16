import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';


import Navbar from '../../components/navbar.jsx';
import FacilityCardWrapper from '../../components/navbarRoutes/facilities/facilityCardWrapper.jsx';
import EndOccupyFacilityModal from '../../components/navbarRoutes/facilities/endOccupyFacilityModal.jsx';
import OverTimeModal from '../../components/export/OverTimeModal.jsx';
import { facilitiesArray }  from '../../components/export/constant.jsx';
import {
    authFetch,
    formatSectionLabel,
    formatYearLevel,
    getBookingEndDateTime,
    getCookie,
    getCourseLabel,
    isBookingPastEnd,
} from '../../components/export/utility.jsx';


import '../../styles/navbarRoutes/facilities/facility.css';

const getFacilityImageKey = (floorId, roomName) => `${floorId}::${roomName}`.toLowerCase();

function Facilities(){

    const user = JSON.parse(getCookie("user") || 'null');
    const role = user?.role;

    const course = getCourseLabel(user?.course);
    const year = formatYearLevel(user?.year);
    const section = formatSectionLabel(user?.section);
    const userCourseYear = [course, year].filter(Boolean).join(' - ');
    const userCourseYearSection = [course, year, section].filter(Boolean).join(' - ');

    const isVisible = (record) =>
        record.requesterEmail === user?.email ||
        (userCourseYearSection && record.requesterDetails?.startsWith(userCourseYearSection)) ||
        (!record.requesterSection && userCourseYear && record.requesterDetails?.startsWith(userCourseYear));
    const [floor, setFloor] = useState(facilitiesArray[0].id);
    const [showEndOccupyFacilityModal, setEndOccupyFacilityModal] = useState(false);
    const [selectedOccupancy, setSelectedOccupancy] = useState(null);
    const [occupancies, setOccupancies] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [facilityImages, setFacilityImages] = useState({});
    const [overTimeItems, setOverTimeItems] = useState([]);
    const [showOverTimeModal, setShowOverTimeModal] = useState(false);
    const autoEndTimers = useRef({});
    const fetchOccupanciesRef = useRef(null);

    const dismissedRef = useRef(new Set());

    const checkOvertime = (data) => {
        const overdue = data.filter(o => isVisible(o) && isBookingPastEnd(o));
        if (overdue.length > 0) {
            const newOverdue = overdue.filter(o => !dismissedRef.current.has(o.id) && !autoEndTimers.current[o.id + '-end']);
            if (newOverdue.length > 0) {
                setOverTimeItems(newOverdue.map(o => ({ name: o.roomName, endTime: o.endTime, id: o.id })));
                setShowOverTimeModal(true);
                newOverdue.forEach(o => {
                    autoEndTimers.current[o.id + '-end'] = setTimeout(() => {
                        authFetch(`/facility-occupancy/${o.id}/end`, { method: 'POST' })
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
        authFetch('/facility-occupancies')
            .then(res => res.json())
            .then(data => {
                setOccupancies(data);
                checkOvertime(data);

                data.filter(o => isVisible(o) && o.endTime).forEach(o => {
                    if (autoEndTimers.current[o.id + '-notify'] || dismissedRef.current.has(o.id)) return;
                    const now = new Date();
                    const endDate = getBookingEndDateTime(o);
                    if (!endDate) return;
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
                                authFetch(`/facility-occupancy/${o.id}/end`, { method: 'POST' })
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
        authFetch('/facility-reservations')
            .then(res => res.json())
            .then(data => setReservations(data))
            .catch(err => console.error(err));
    };

    const fetchFacilityImages = () => {
        authFetch('/facility-images')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const items = Array.isArray(data) ? data : data?.items || data?.facilityImages || [];
                const nextFacilityImages = {};

                items.forEach(item => {
                    if (!item?.floorId || !item?.roomName || !item?.imageUrl) return;
                    nextFacilityImages[getFacilityImageKey(item.floorId, item.roomName)] = item.imageUrl;
                });

                setFacilityImages(nextFacilityImages);
            })
            .catch(err => console.error(err));
    };

    const handleFacilityImageUpdated = (item) => {
        if (!item?.floorId || !item?.roomName || !item?.imageUrl) return;

        setFacilityImages(prev => ({
            ...prev,
            [getFacilityImageKey(item.floorId, item.roomName)]: item.imageUrl,
        }));
    };

    const handleMarkAvailable = async (id) => {
        try {
            const response = await authFetch(`/facility-reservation/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to mark facility available.');
            toast.success('Facility marked available.');
            fetchReservations();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to mark facility available.');
        }
    };

    useEffect(() => {
        fetchFacilityImages();

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

    const formatTime = (time) => {
        if (!time) return '-';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
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
        if (!endDate || startDate === endDate) return startDate || endDate;
        return `${startDate} - ${endDate}`;
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
                    <FacilityCardWrapper
                        floorValue={floor}
                        facilityImages={facilityImages}
                        onOccupied={fetchOccupancies}
                        onFacilityImageUpdated={handleFacilityImageUpdated}
                    />
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
                                    <th>DATE</th>
                                    <th>TIME</th>
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
                                        <td>{formatDateRange(r.date, r.endDate)}</td>
                                        <td>{formatTimeRange(r.startTime, r.endTime)}</td>
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

import React, { useState } from "react";

import { toast } from "react-toastify";
import '../../../styles/navbarRoutes/equipment/requestEquipmentModal.css';


function EndOccupyFacilityModal({ setEndOccupyFacilityModal, occupancyId, onEnded }){

    const [loading, setLoading] = useState(false);

    const handleEndConfirm = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:5000/facility-occupancy/${occupancyId}/end`, {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Facility is now available again!");
                if (onEnded) onEnded();
                setEndOccupyFacilityModal(false);
            } else {
                toast.error(data.message || 'Failed to end occupancy.');
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
            <div className="facility-request-modal-container">
                <div className="occupy-modal-details">
                    <h1>End Occupy Facility</h1>
                    <p>Are you sure you want to end occupying this facility?</p>

                    <div className="occupy-btns-container">
                        <button
                            className="occupy-btns"
                            type="button"
                            onClick={() => setEndOccupyFacilityModal(false)}
                        >
                            CANCEL
                        </button>
                        <button
                            className="occupy-btns"
                            onClick={handleEndConfirm}
                            disabled={loading}
                        >
                            {loading ? 'ENDING...' : 'CONFIRM'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EndOccupyFacilityModal

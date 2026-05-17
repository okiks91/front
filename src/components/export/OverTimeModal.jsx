import React from 'react';
import { formatTime } from './utility.jsx';

function OverTimeModal({ items, onClose }) {
    const isEnded = items.length > 0 && items[0].ended;

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                background: '#fff', borderRadius: '12px', padding: '32px',
                maxWidth: '480px', width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
                {isEnded ? (
                    <>
                        <h2 style={{ color: '#27ae60', marginBottom: '12px' }}>✓ Session Ended</h2>
                        <p style={{ marginBottom: '12px' }}>The following session has been automatically ended:</p>
                        <ul style={{ textAlign: 'left', marginBottom: '20px', paddingLeft: '20px' }}>
                            {items.map((item, i) => (
                                <li key={i} style={{ marginBottom: '6px' }}>
                                    <strong>{item.name}</strong>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <>
                        <h2 style={{ color: '#c0392b', marginBottom: '12px' }}>⚠ Overtime Warning</h2>
                        <p style={{ marginBottom: '12px' }}>You have gone over your set end time for:</p>
                        <ul style={{ textAlign: 'left', marginBottom: '16px', paddingLeft: '20px' }}>
                            {items.map((item, i) => (
                                <li key={i} style={{ marginBottom: '6px' }}>
                                    <strong>{item.name}</strong> — ended at {formatTime(item.endTime)}
                                </li>
                            ))}
                        </ul>
                        <p style={{ marginBottom: '20px', color: '#555' }}>
                            Your session will be automatically ended in <strong>5 minutes</strong>.
                        </p>
                    </>
                )}
                <button
                    onClick={onClose}
                    style={{
                        padding: '10px 32px', backgroundColor: '#1a1a2e', color: '#fff',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
                    }}
                >
                    OKAY
                </button>
            </div>
        </div>
    );
}

export default OverTimeModal;

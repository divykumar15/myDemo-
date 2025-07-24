import { useState } from 'react';

function CustomerView({ contract }) {
    const [shipmentId, setShipmentId] = useState('');
    const [shipmentDetails, setShipmentDetails] = useState(null);
    const [error, setError] = useState('');
    const statusMap = ["Pending", "In Transit", "Delivered"];

    const trackShipment = async (e) => {
        e.preventDefault();
        if (!contract || !shipmentId) return;
        setError('');
        setShipmentDetails(null);
        try {
            const details = await contract.getShipmentDetails(shipmentId);
            setShipmentDetails(details);
        } catch (err) {
            console.error("Error tracking shipment:", err);
            setError("Invalid Shipment ID or error fetching data.");
        }
    };

    return (
        <div className="container">
            <h3>Track a Shipment</h3>
            <form onSubmit={trackShipment} className="form-section">
                <input type="number" placeholder="Enter Shipment ID" value={shipmentId} onChange={e => setShipmentId(e.target.value)} />
                <button type="submit">Track</button>
            </form>

            {error && <p className="error">{error}</p>}

            {shipmentDetails && (
                <div className="shipment-details">
                    <h4>Shipment Details (ID: {Number(shipmentDetails.id)})</h4>
                    <p><strong>Product:</strong> {shipmentDetails.productName}</p>
                    <p><strong>Status:</strong> <span className={`status status-${Number(shipmentDetails.status)}`}>{statusMap[Number(shipmentDetails.status)]}</span></p>
                    <p><strong>Vendor:</strong> {shipmentDetails.vendor}</p>
                    <p><strong>Customer:</strong> {shipmentDetails.customer}</p>
                    <p><strong>Delivery Hub:</strong> {shipmentDetails.deliveryHub}</p>
                    <p><strong>Created:</strong> {new Date(Number(shipmentDetails.createdAt) * 1000).toLocaleString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(Number(shipmentDetails.lastUpdatedAt) * 1000).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
}

export default CustomerView;
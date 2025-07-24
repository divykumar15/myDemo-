import { useState, useEffect } from 'react';

function DeliveryHubDashboard({ contract, provider, account, userInfo }) {
    const [shipments, setShipments] = useState([]);
    const statusMap = ["Pending", "In Transit", "Delivered"];

    const fetchShipments = async () => {
        if (!contract || !account) return;
        try {
            const shipmentIds = await contract.getDeliveryHubShipmentIds(account);
            const shipmentDetails = await Promise.all(
                shipmentIds.map(id => contract.getShipmentDetails(id))
            );
            setShipments(shipmentDetails);
        } catch (error) {
            console.error("Error fetching shipments:", error);
        }
    };
    
    useEffect(() => {
        fetchShipments();
    }, [contract, account]);

    const updateStatus = async (shipmentId) => {
        if (!contract || !provider) return;
        try {
            const signer = await provider.getSigner();
            const contractWithSigner = contract.connect(signer);
            const tx = await contractWithSigner.updateShipmentStatus(shipmentId);
            await tx.wait();
            alert("Shipment status updated!");
            fetchShipments(); // Refresh list
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    return (
        <div className="container dashboard">
            <h2>Delivery Hub Dashboard</h2>
            <p>Welcome, {userInfo.name}! {userInfo.isApproved ? "✅ You are approved." : "⏳ Your registration is pending."}</p>
            
            {userInfo.isApproved && (
                <div className="list-section">
                    <h3>Your Assigned Shipments</h3>
                    {shipments.length === 0 ? <p>No shipments assigned to you yet.</p> : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.map(shipment => (
                                    <tr key={Number(shipment.id)}>
                                        <td>{Number(shipment.id)}</td>
                                        <td>{shipment.productName}</td>
                                        <td>{statusMap[Number(shipment.status)]}</td>
                                        <td>
                                            {Number(shipment.status) < 2 && (
                                                <button onClick={() => updateStatus(shipment.id)}>
                                                    Update to {statusMap[Number(shipment.status) + 1]}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

export default DeliveryHubDashboard;
import { useState } from 'react';

function VendorDashboard({ contract, provider, userInfo }) {
    const [productName, setProductName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [hubAddress, setHubAddress] = useState('');

    const createShipment = async (e) => {
        e.preventDefault();
        if (!contract || !provider) return;
        try {
            const signer = await provider.getSigner();
            const contractWithSigner = contract.connect(signer);
            const tx = await contractWithSigner.createShipment(productName, customerAddress, hubAddress);
            await tx.wait();
            alert("Shipment created successfully!");
            setProductName('');
            setCustomerAddress('');
            setHubAddress('');
        } catch (error) {
            console.error("Error creating shipment:", error);
            alert("Failed to create shipment. Check hub address and your approval status.");
        }
    };

    return (
        <div className="container dashboard">
            <h2>Vendor Dashboard</h2>
            <p>Welcome, {userInfo.name}! {userInfo.isApproved ? "✅ You are approved." : "⏳ Your registration is pending."}</p>
            
            {userInfo.isApproved && (
                <div className="form-section">
                    <h3>Create New Shipment</h3>
                    <form onSubmit={createShipment}>
                        <input type="text" placeholder="Product Name" value={productName} onChange={e => setProductName(e.target.value)} required />
                        <input type="text" placeholder="Customer Wallet Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} required />
                        <input type="text" placeholder="Delivery Hub Wallet Address" value={hubAddress} onChange={e => setHubAddress(e.target.value)} required />
                        <button type="submit">Create Shipment</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default VendorDashboard;
import { useState, useEffect } from 'react';

function AdminDashboard({ contract, provider }) {
    const [pendingVendors, setPendingVendors] = useState([]);
    const [pendingHubs, setPendingHubs] = useState([]);

    const fetchPending = async () => {
        if (!contract) return;
        try {
            const vendors = await contract.getPendingVendors();
            const hubs = await contract.getPendingDeliveryHubs();
            
            // Fetch names for each address
            const vendorData = await Promise.all(vendors.map(async (addr) => {
                const info = await contract.getUserInfo(addr);
                return { address: addr, name: info[0] };
            }));

            const hubData = await Promise.all(hubs.map(async (addr) => {
                const info = await contract.getUserInfo(addr);
                return { address: addr, name: info[0] };
            }));

            setPendingVendors(vendorData);
            setPendingHubs(hubData);
        } catch (error) {
            console.error("Error fetching pending users:", error);
        }
    };

    useEffect(() => {
        fetchPending();
    }, [contract]);

    const approveUser = async (address) => {
        if (!contract || !provider) return;
        try {
            const signer = await provider.getSigner();
            const contractWithSigner = contract.connect(signer);
            const tx = await contractWithSigner.approveUser(address);
            await tx.wait();
            alert(`User ${address} approved!`);
            fetchPending(); // Refresh the list
        } catch (error) {
            console.error("Error approving user:", error);
            alert("Approval failed.");
        }
    };

    return (
        <div className="container dashboard">
            <h2>Admin Dashboard</h2>
            <div className="list-section">
                <h3>Pending Vendor Requests</h3>
                {pendingVendors.length === 0 ? <p>No pending vendor requests.</p> : (
                    <ul>
                        {pendingVendors.map(vendor => (
                            <li key={vendor.address}>
                                <span>{vendor.name} ({vendor.address.substring(0, 6)}...{vendor.address.substring(38)})</span>
                                <button onClick={() => approveUser(vendor.address)}>Approve</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="list-section">
                <h3>Pending Delivery Hub Requests</h3>
                {pendingHubs.length === 0 ? <p>No pending delivery hub requests.</p> : (
                    <ul>
                        {pendingHubs.map(hub => (
                            <li key={hub.address}>
                                <span>{hub.name} ({hub.address.substring(0, 6)}...{hub.address.substring(38)})</span>
                                <button onClick={() => approveUser(hub.address)}>Approve</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </div>
    );
}

export default AdminDashboard;
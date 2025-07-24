import { useState } from 'react';
import CustomerView from './CustomerView';

function Home({ connectWallet, account, contract, provider, userInfo }) {
    const [name, setName] = useState('');

    const register = async (role) => {
        if (!name || !contract || !provider) return;
        try {
            const signer = await provider.getSigner();
            const contractWithSigner = contract.connect(signer);
            let tx;
            if (role === 'vendor') {
                tx = await contractWithSigner.registerVendor(name);
            } else {
                tx = await contractWithSigner.registerDeliveryHub(name);
            }
            await tx.wait();
            alert(`${role.charAt(0).toUpperCase() + role.slice(1)} registration request sent! Please wait for admin approval.`);
            window.location.reload();
        } catch (error) {
            console.error(`Error registering ${role}:`, error);
            alert(`Registration failed. Are you already registered?`);
        }
    };

    return (
        <div className="container">
            <h2>Welcome to the Supply Chain DApp</h2>
            {!account ? (
                <button onClick={connectWallet}>Connect Wallet to Get Started</button>
            ) : (
                <>
                    {userInfo.name ? (
                        <p>Welcome, {userInfo.name}! {userInfo.isApproved ? "You are approved." : "Your registration is pending approval."}</p>
                    ) : (
                         <div className="form-section">
                            <h3>Register</h3>
                            <input type="text" placeholder="Enter Your Name" value={name} onChange={(e) => setName(e.target.value)} />
                            <button onClick={() => register('vendor')}>Register as Vendor</button>
                            <button onClick={() => register('hub')}>Register as Delivery Hub</button>
                        </div>
                    )}
                </>
            )}

            <hr />
            <CustomerView contract={contract} />
        </div>
    );
}

export default Home;
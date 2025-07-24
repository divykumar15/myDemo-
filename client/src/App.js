import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import SupplyChain from './artifacts/contracts/SupplyChain.sol/SupplyChain.json';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import VendorDashboard from './components/VendorDashboard';
import DeliveryHubDashboard from './components/DeliveryHubDashboard';
import './App.css';

const contractAddress = "0xc5A1194De972ab59756611e9a3d4501d097d97b7";
const adminAddress = "0x6F32280a2c8Bd47fADc5732c55DcADDdEf6624Ec";

function App() {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [role, setRole] = useState(null);
    const [userInfo, setUserInfo] = useState({ name: '', isApproved: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (window.ethereum) {
                const providerInstance = new ethers.BrowserProvider(window.ethereum);
                setProvider(providerInstance);

                const contractInstance = new ethers.Contract(contractAddress, SupplyChain.abi, providerInstance);
                setContract(contractInstance);

                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length === 0) {
                        disconnectWallet(); // If wallet disconnected manually
                    } else {
                        setAccount(accounts[0]);
                    }
                });

            } else {
                alert('Please install MetaMask!');
            }
            setLoading(false);
        };

        loadBlockchainData();
    }, []);

    useEffect(() => {
        const checkRole = async () => {
            if (account && contract) {
                setLoading(true);
                try {
                    if (account.toLowerCase() === adminAddress.toLowerCase()) {
                        setRole(1);
                        setUserInfo({ name: 'Admin', isApproved: true });
                    } else {
                        const userRole = await contract.getRole(account);
                        const userData = await contract.getUserInfo(account);
                        setRole(Number(userRole));
                        setUserInfo({ name: userData[0], isApproved: userData[1] });
                    }
                } catch (error) {
                    console.error("Error checking role:", error);
                    setRole(0);
                }
                setLoading(false);
            } else {
                setRole(null);
            }
        };

        checkRole();
    }, [account, contract]);

    const connectWallet = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
        } catch (error) {
            console.error("Error connecting wallet:", error);
        }
    };

    const disconnectWallet = () => {
        // Reset all state
        setAccount(null);
        setRole(null);
        setUserInfo({ name: '', isApproved: false });
    };

 const renderDashboard = () => {
    if (loading) return <div className="loading">Loading...</div>;

    const backButton = <button onClick={() => setRole(null)}>⬅ Back to Home</button>;

    switch (role) {
        case 1:
            return (
                <>
                    {backButton}
                    <AdminDashboard contract={contract} provider={provider} />
                </>
            );
        case 2:
            return (
                <>
                    {backButton}
                    <VendorDashboard contract={contract} provider={provider} userInfo={userInfo} />
                </>
            );
        case 3:
            return (
                <>
                    {backButton}
                    <DeliveryHubDashboard contract={contract} provider={provider} account={account} userInfo={userInfo} />
                </>
            );
        default:
            return <Home connectWallet={connectWallet} account={account} contract={contract} provider={provider} userInfo={userInfo} />;
    }
};

    return (
        <div className="App">
            <header className="App-header">
                <h1>🚀 Blockchain Supply Chain</h1>
                {!account ? (
                    <button onClick={connectWallet}>Connect Wallet</button>
                ) : (
                    <div>
                        <p className="account-info">Connected: {account.substring(0, 6)}...{account.substring(38)}</p>
                        <button onClick={disconnectWallet}>Disconnect Wallet</button>
                    </div>
                )}
            </header>
            <main>
                {renderDashboard()}
            </main>
        </div>
    );
}

export default App;

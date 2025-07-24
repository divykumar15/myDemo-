// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {
    // Admin address set at deployment
    address public immutable admin;

    // Counters
    uint256 public shipmentCounter;

    // Enums for clarity
    enum ShipmentStatus { Pending, InTransit, Delivered }
    enum Role { None, Admin, Vendor, DeliveryHub }

    // Structs to hold data
    struct User {
        string name;
        address walletAddress;
        bool isApproved;
        Role role;
    }

    struct Shipment {
        uint256 id;
        string productName;
        address vendor;
        address customer;
        address deliveryHub;
        ShipmentStatus status;
        uint256 createdAt;
        uint256 lastUpdatedAt;
    }

    // Mappings for storage
    mapping(address => User) public users;
    mapping(uint256 => Shipment) public shipments;
    mapping(address => uint256[]) public deliveryHubShipments;

    // Arrays to track registrations
    address[] public pendingVendorList;
    address[] public pendingDeliveryHubList;

    // Events for off-chain monitoring
    event UserRegistered(address indexed userAddress, string name, Role role);
    event UserApproved(address indexed userAddress, Role role);
    event ShipmentCreated(uint256 indexed shipmentId, address indexed vendor, address customer, address indexed deliveryHub);
    event ShipmentStatusUpdated(uint256 indexed shipmentId, ShipmentStatus newStatus);

    // Modifiers for access control
    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.Admin, "Only admin can perform this action");
        _;
    }

    modifier onlyApprovedVendor() {
        require(users[msg.sender].role == Role.Vendor && users[msg.sender].isApproved, "Only an approved vendor can perform this action");
        _;
    }

    modifier onlyAssignedDeliveryHub(uint256 _shipmentId) {
        require(shipments[_shipmentId].deliveryHub == msg.sender, "Only the assigned delivery hub can update this shipment");
        require(users[msg.sender].role == Role.DeliveryHub && users[msg.sender].isApproved, "User is not an approved delivery hub");
        _;
    }

    constructor() {
        // The admin is the one who deploys the contract
        admin = 0x6F32280a2c8Bd47fADc5732c55DcADDdEf6624Ec;
        users[admin] = User({
            name: "Admin",
            walletAddress: admin,
            isApproved: true,
            role: Role.Admin
        });
    }

    // --- Registration Functions ---
    function registerVendor(string memory _name) public {
        require(users[msg.sender].role == Role.None, "User is already registered");
        users[msg.sender] = User({
            name: _name,
            walletAddress: msg.sender,
            isApproved: false,
            role: Role.Vendor
        });
        pendingVendorList.push(msg.sender);
        emit UserRegistered(msg.sender, _name, Role.Vendor);
    }

    function registerDeliveryHub(string memory _name) public {
        require(users[msg.sender].role == Role.None, "User is already registered");
        users[msg.sender] = User({
            name: _name,
            walletAddress: msg.sender,
            isApproved: false,
            role: Role.DeliveryHub
        });
        pendingDeliveryHubList.push(msg.sender);
        emit UserRegistered(msg.sender, _name, Role.DeliveryHub);
    }

    // --- Admin Functions ---
    function approveUser(address _userAddress) public onlyAdmin {
        require(!users[_userAddress].isApproved, "User is already approved");
        users[_userAddress].isApproved = true;
        
        // Remove from pending list (this is a simple implementation)
        if (users[_userAddress].role == Role.Vendor) {
            // This is a naive removal; for production, a more gas-efficient method is needed
            for (uint i = 0; i < pendingVendorList.length; i++) {
                if (pendingVendorList[i] == _userAddress) {
                    pendingVendorList[i] = pendingVendorList[pendingVendorList.length - 1];
                    pendingVendorList.pop();
                    break;
                }
            }
        } else if (users[_userAddress].role == Role.DeliveryHub) {
            for (uint i = 0; i < pendingDeliveryHubList.length; i++) {
                if (pendingDeliveryHubList[i] == _userAddress) {
                    pendingDeliveryHubList[i] = pendingDeliveryHubList[pendingDeliveryHubList.length - 1];
                    pendingDeliveryHubList.pop();
                    break;
                }
            }
        }

        emit UserApproved(_userAddress, users[_userAddress].role);
    }

    // --- Vendor Function ---
    function createShipment(string memory _productName, address _customer, address _deliveryHub) public onlyApprovedVendor {
        require(users[_deliveryHub].role == Role.DeliveryHub && users[_deliveryHub].isApproved, "Invalid or unapproved delivery hub");
        shipmentCounter++;
        uint256 newShipmentId = shipmentCounter;

        shipments[newShipmentId] = Shipment({
            id: newShipmentId,
            productName: _productName,
            vendor: msg.sender,
            customer: _customer,
            deliveryHub: _deliveryHub,
            status: ShipmentStatus.Pending,
            createdAt: block.timestamp,
            lastUpdatedAt: block.timestamp
        });

        deliveryHubShipments[_deliveryHub].push(newShipmentId);
        emit ShipmentCreated(newShipmentId, msg.sender, _customer, _deliveryHub);
    }

    // --- Delivery Hub Function ---
    function updateShipmentStatus(uint256 _shipmentId) public onlyAssignedDeliveryHub(_shipmentId) {
        Shipment storage shipment = shipments[_shipmentId];
        require(shipment.status != ShipmentStatus.Delivered, "Shipment already delivered");

        if (shipment.status == ShipmentStatus.Pending) {
            shipment.status = ShipmentStatus.InTransit;
        } else if (shipment.status == ShipmentStatus.InTransit) {
            shipment.status = ShipmentStatus.Delivered;
        }
        
        shipment.lastUpdatedAt = block.timestamp;
        emit ShipmentStatusUpdated(_shipmentId, shipment.status);
    }

    // --- View Functions (Getters) ---
    function getRole(address _userAddress) public view returns (Role) {
        return users[_userAddress].role;
    }

    function getUserInfo(address _userAddress) public view returns (string memory name, bool isApproved) {
        User storage user = users[_userAddress];
        return (user.name, user.isApproved);
    }

    function getShipmentDetails(uint256 _shipmentId) public view returns (Shipment memory) {
        require(_shipmentId > 0 && _shipmentId <= shipmentCounter, "Invalid shipment ID");
        return shipments[_shipmentId];
    }

    function getPendingVendors() public view returns (address[] memory) {
        return pendingVendorList;
    }

    function getPendingDeliveryHubs() public view returns (address[] memory) {
        return pendingDeliveryHubList;
    }

    function getDeliveryHubShipmentIds(address _hubAddress) public view returns (uint256[] memory) {
        return deliveryHubShipments[_hubAddress];
    }
}
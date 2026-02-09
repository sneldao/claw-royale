pragma solidity ^0.8.20;

contract MockAgentVerifier {
    mapping(address => bool) public isVerified;
    
    function setVerified(address addr, bool status) external {
        isVerified[addr] = status;
    }
    
    function canParticipate(bytes32, address addr) external view returns (bool) {
        return isVerified[addr];
    }
}

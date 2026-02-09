// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title AgentVerifier
 * @notice Verifies agents via ERC-8004 identity + challenge-response
 */
contract AgentVerifier is Ownable, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant VERIFY_TYPEHASH = keccak256("VerifyAgent(bytes32 agentId,uint256 nonce,bytes32 challenge)");
    
    // ERC-8004 registry interface
    IAgentRegistry public agentRegistry;
    
    // Verified agents
    mapping(bytes32 => bool) public isVerified;
    mapping(bytes32 => uint256) public nonces;
    
    // Challenge hash -> answer
    mapping(bytes32 => bytes32) public challenges;
    
    // Moltbook verification
    mapping(address => bool) public moltbookVerified;
    
    event AgentVerified(bytes32 indexed agentId, address indexed ethAddress);
    event ChallengePosted(bytes32 indexed agentId, bytes32 challenge);
    event ChallengeSolved(bytes32 indexed agentId, bool success);
    
    constructor(address _agentRegistry) Ownable(msg.sender) EIP712("ClawRoyale", "1") {
        agentRegistry = IAgentRegistry(_agentRegistry);
    }
    
    /**
     * @notice Post a cryptographic challenge for an agent
     */
    function postChallenge(bytes32 _agentId, bytes32 _challenge) external onlyOwner {
        challenges[_agentId] = _challenge;
        emit ChallengePosted(_agentId, _challenge);
    }
    
    /**
     * @notice Submit verification proof
     * @param _agentId The agent's ERC-8004 identity
     * @param _challengeAnswer Hash of the solution
     * @param _signature Agent's signature on the verification
     */
    function verifyAgent(
        bytes32 _agentId,
        bytes32 _challengeAnswer,
        bytes calldata _signature
    ) external {
        require(challenges[_agentId] != bytes32(0), "No challenge posted");
        require(!isVerified[_agentId], "Already verified");
        
        // Verify signature
        bytes32 structHash = keccak256(abi.encode(
            VERIFY_TYPEHASH,
            _agentId,
            nonces[_agentId]++,
            _challengeAnswer
        ));
        
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(_signature);
        
        // Verify via ERC-8004 registry
        require(agentRegistry.ownerOf(uint256(_agentId)) == signer, "Invalid signature");
        
        // Verify challenge answer
        bytes32 expectedAnswer = keccak256(abi.encodePacked(
            challenges[_agentId],
            signer
        ));
        require(_challengeAnswer == expectedAnswer, "Wrong answer");
        
        isVerified[_agentId] = true;
        emit AgentVerified(_agentId, signer);
    }
    
    /**
     * @notice Verify via Moltbook (alternative verification)
     */
    function verifyMoltbook(address _ethAddress) external onlyOwner {
        moltbookVerified[_ethAddress] = true;
    }
    
    /**
     * @notice Check if an agent can participate
     */
    function canParticipate(bytes32 _agentId, address _ethAddress) external view returns (bool) {
        return isVerified[_agentId] || moltbookVerified[_ethAddress];
    }
}

interface IAgentRegistry {
    function ownerOf(uint256 tokenId) external view returns (address);
}

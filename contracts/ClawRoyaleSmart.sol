// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ClawRoyaleSmart - Smart Account Enabled Tournament
 * @notice Integrates with MetaMask Smart Accounts Kit for gasless transactions
 * and delegation-based permissions
 */
contract ClawRoyaleSmart is Ownable, ReentrancyGuard {
    IERC20 public usdcToken;
    
    // Entry fee
    uint256 public entryFee = 5 * 1e6; // 5 USDC
    
    // Prize pool
    uint256 public prizePool;
    uint256 public platformFee = 0; // 0% for hackathon demo
    
    // Referral rewards (10% of entry fee)
    uint256 public referralReward = 0.5 * 1e6; // 0.5 USDC
    
    // Smart account tracking
    mapping(address => bool) public isSmartAccount;
    mapping(address => bool) public registeredPlayers;
    address[] public playerList;
    
    // Delegation registry for betting permissions
    mapping(address => DelegationConfig) public delegationConfigs;
    
    struct DelegationConfig {
        bool hasDelegation;
        uint256 maxBetAmount;
        uint256 delegationExpiry;
        address delegatee; // ClawRoyaleSmart contract itself
    }
    
    // Paymaster sponsor tracking
    mapping(address => bool) public gasSponsored;
    
    // Tournament state
    enum TournamentStatus { Pending, Active, Completed }
    TournamentStatus public status;
    
    // Events - Smart Account
    event SmartAccountRegistered(address indexed smartAccount, address indexed delegate);
    event GasSponsored(address indexed account, uint256 estimatedGas);
    
    // Events - Delegation
    event DelegationConfigured(address indexed account, uint256 maxBet, uint256 expiry);
    event DelegationRevoked(address indexed account);
    
    // Events - Registration
    event PlayerRegistered(address indexed smartAccount, uint256 amount);
    event ReferralRewardPaid(address indexed referrer, uint256 amount);
    
    // Events - Prizes
    event PrizeClaimed(address indexed player, uint256 amount);
    
    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        status = TournamentStatus.Pending;
    }
    
    // =====================
    // SMART ACCOUNT REGISTRATION
    // =====================
    
    /**
     * @notice Register using Smart Account (gasless via paymaster)
     * @param _agentId Agent's ERC-8004 ID
     * @param _referrer Address who referred this agent
     * @param _delegate Delegation configuration data (packed)
     */
    function registerSmart(
        bytes32 _agentId,
        address _referrer,
        bytes calldata _delegate
    ) external nonReentrant {
        require(!registeredPlayers[msg.sender], "Already registered");
        require(status == TournamentStatus.Pending, "Tournament started");
        
        // Mark as smart account
        isSmartAccount[msg.sender] = true;
        
        // Parse delegation config from bytes (simplified)
        if (_delegate.length > 0) {
            (uint256 maxBet, uint256 expiry) = abi.decode(_delegate, (uint256, uint256));
            if (expiry > block.timestamp) {
                delegationConfigs[msg.sender] = DelegationConfig({
                    hasDelegation: true,
                    maxBetAmount: maxBet,
                    delegationExpiry: expiry,
                    delegatee: address(this)
                });
                emit DelegationConfigured(msg.sender, maxBet, expiry);
            }
        }
        
        // Collect entry fee
        require(usdcToken.transferFrom(msg.sender, address(this), entryFee), "Entry fee failed");
        
        // Pay referrer if exists
        if (_referrer != address(0) && registeredPlayers[_referrer]) {
            require(usdcToken.transfer(_referrer, referralReward), "Referral transfer failed");
            prizePool -= referralReward;
            emit ReferralRewardPaid(_referrer, referralReward);
        }
        
        // Add to prize pool
        prizePool += entryFee - referralReward;
        
        registeredPlayers[msg.sender] = true;
        playerList.push(msg.sender);
        
        emit PlayerRegistered(msg.sender, entryFee);
    }
    
    /**
     * @notice Execute batch registration + betting via smart account
     * @param _agentId Agent's ERC-8004 ID
     * @param _betAmount Amount to bet on first match
     * @param _referrer Address who referred this agent
     */
    function registerAndBet(
        bytes32 _agentId,
        uint256 _betAmount,
        address _referrer
    ) external nonReentrant {
        require(!registeredPlayers[msg.sender], "Already registered");
        require(status == TournamentStatus.Pending, "Tournament started");
        
        // Mark as smart account
        isSmartAccount[msg.sender] = true;
        
        // Configure delegation for betting
        if (_betAmount > 0) {
            delegationConfigs[msg.sender] = DelegationConfig({
                hasDelegation: true,
                maxBetAmount: _betAmount,
                delegationExpiry: block.timestamp + 7 days,
                delegatee: address(this)
            });
            emit DelegationConfigured(msg.sender, _betAmount, block.timestamp + 7 days);
        }
        
        // Collect entry fee
        require(usdcToken.transferFrom(msg.sender, address(this), entryFee), "Entry fee failed");
        
        // Pay referrer
        if (_referrer != address(0) && registeredPlayers[_referrer]) {
            require(usdcToken.transfer(_referrer, referralReward), "Referral transfer failed");
            prizePool -= referralReward;
            emit ReferralRewardPaid(_referrer, referralReward);
        }
        
        prizePool += entryFee - referralReward;
        registeredPlayers[msg.sender] = true;
        playerList.push(msg.sender);
        
        emit PlayerRegistered(msg.sender, entryFee);
    }
    
    // =====================
    // DELEGATION MANAGEMENT
    // =====================
    
    /**
     * @notice Configure delegation permissions for betting
     * @param _maxBetAmount Maximum bet allowed
     * @param _durationSeconds How long delegation is valid
     */
    function configureDelegation(
        uint256 _maxBetAmount,
        uint256 _durationSeconds
    ) external nonReentrant {
        delegationConfigs[msg.sender] = DelegationConfig({
            hasDelegation: true,
            maxBetAmount: _maxBetAmount,
            delegationExpiry: block.timestamp + _durationSeconds,
            delegatee: address(this)
        });
        
        emit DelegationConfigured(msg.sender, _maxBetAmount, block.timestamp + _durationSeconds);
    }
    
    /**
     * @notice Revoke delegation permissions
     */
    function revokeDelegation() external {
        delete delegationConfigs[msg.sender];
        emit DelegationRevoked(msg.sender);
    }
    
    /**
     * @notice Execute bet via delegation (atomic batch)
     * @param _target Target contract for bet
     * @param _calldata Bet calldata
     */
    function executeDelegatedBet(
        address _target,
        bytes calldata _calldata
    ) external nonReentrant {
        require(isSmartAccount[msg.sender], "Not smart account");
        
        DelegationConfig memory config = delegationConfigs[msg.sender];
        require(config.hasDelegation, "No delegation configured");
        require(block.timestamp < config.delegationExpiry, "Delegation expired");
        
        // Execute via delegatecall (simplified - in production use proper delegation framework)
        (bool success, ) = _target.delegatecall(_calldata);
        require(success, "Delegated call failed");
    }
    
    // =====================
    // GAS SPONSORSHIP (PAYMASTER)
    // =====================
    
    /**
     * @notice Record gas sponsorship from paymaster
     */
    function recordGasSponsorship() external {
        gasSponsored[msg.sender] = true;
        emit GasSponsored(msg.sender, tx.gasprice * gasleft());
    }
    
    // =====================
    // PRIZE POOL MANAGEMENT
    // =====================
    
    /**
     * @notice Fund the prize pool
     */
    function fundPrizePool(uint256 _amount) external nonReentrant {
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        prizePool += _amount;
    }
    
    /**
     * @notice Fund prize pool via smart account delegation
     */
    function fundPrizePoolDelegated(uint256 _amount) external nonReentrant {
        DelegationConfig memory config = delegationConfigs[msg.sender];
        require(config.hasDelegation, "No delegation configured");
        require(config.maxBetAmount >= _amount, "Exceeds delegation limit");
        require(block.timestamp < config.delegationExpiry, "Delegation expired");
        
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        prizePool += _amount;
    }
    
    // =====================
    // TOURNAMENT MANAGEMENT
    // =====================
    
    function startTournament() external onlyOwner {
        require(status == TournamentStatus.Pending, "Invalid status");
        require(playerList.length >= 2, "Need 2+ players");
        status = TournamentStatus.Active;
    }
    
    function completeTournament() external onlyOwner {
        require(status == TournamentStatus.Active, "Invalid status");
        status = TournamentStatus.Completed;
    }
    
    // =====================
    // PRIZE DISTRIBUTION
    // =====================
    
    /**
     * @notice Claim prize - supports smart accounts
     */
    function claimPrize(uint256 _amount) external nonReentrant {
        require(status == TournamentStatus.Completed, "Tournament not ended");
        require(registeredPlayers[msg.sender], "Not registered");
        
        require(usdcToken.transfer(msg.sender, _amount), "Transfer failed");
        emit PrizeClaimed(msg.sender, _amount);
    }
    
    /**
     * @notice Batch claim for multiple winners
     */
    function batchClaimPrizes(address[] calldata _players, uint256[] calldata _amounts) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(_players.length == _amounts.length, "Length mismatch");
        
        for (uint256 i = 0; i < _players.length; i++) {
            require(registeredPlayers[_players[i]], "Not registered");
            require(usdcToken.transfer(_players[i], _amounts[i]), "Transfer failed");
            emit PrizeClaimed(_players[i], _amounts[i]);
        }
    }
    
    // =====================
    // VIEW FUNCTIONS
    // =====================
    
    function getPlayerCount() external view returns (uint256) {
        return playerList.length;
    }
    
    function hasValidDelegation(address _account) external view returns (bool) {
        DelegationConfig memory config = delegationConfigs[_account];
        return config.hasDelegation && block.timestamp < config.delegationExpiry;
    }
    
    function getDelegationLimit(address _account) external view returns (uint256) {
        DelegationConfig memory config = delegationConfigs[_account];
        if (config.hasDelegation && block.timestamp < config.delegationExpiry) {
            return config.maxBetAmount;
        }
        return 0;
    }
}

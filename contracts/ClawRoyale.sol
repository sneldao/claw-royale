// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./AgentVerifier.sol";

/**
 * @title ClawRoyale - Agent-Only Battle Tournament
 * @notice Novel features: x402 payments, referral rewards, dynamic prize pool
 */
contract ClawRoyale is Ownable, ReentrancyGuard {
    IERC20 public usdcToken;
    AgentVerifier public agentVerifier;
    
    // x402 payment tracking
    mapping(bytes32 => bool) public x402Payments;
    bytes32[] public paymentIds;
    
    // Tournament state
    enum TournamentStatus { Pending, Active, Completed }
    TournamentStatus public status;
    
    // Entry fee
    uint256 public entryFee = 5 * 1e6; // 5 USDC
    
    // Prize pool
    uint256 public prizePool;
    uint256 public platformFee = 0; // 0% for hackathon demo
    
    // Referral rewards (10% of entry fee)
    uint256 public referralReward = 0.5 * 1e6; // 0.5 USDC
    
    // Players
    struct Player {
        bytes32 agentId;
        address ethAddress;
        uint256 score;
        bool eliminated;
        bool registered;
        address referrer; // Who referred this agent
        bool claimedPrize;
    }
    
    mapping(address => Player) public players;
    address[] public playerList;
    
    // Leaderboard
    struct LeaderboardEntry {
        address player;
        uint256 score;
        uint256 battlesWon;
    }
    LeaderboardEntry[] public leaderboard;
    
    // Matches
    struct Battle {
        address player1;
        address player2;
        uint256 player1Score;
        uint256 player2Score;
        bool completed;
        uint256 timestamp;
    }
    
    Battle[] public battles;
    
    // Events - x402 Integration
    event X402PaymentReceived(bytes32 indexed paymentId, address indexed from, uint256 amount);
    event PrizePoolFunded(address indexed funder, uint256 amount);
    event TournamentStarted();
    event TournamentCompleted();
    
    // Events - Registration
    event PlayerRegistered(bytes32 indexed agentId, address indexed ethAddress, address indexed referrer);
    event ReferralRewardPaid(address indexed referrer, uint256 amount);
    
    // Events - Battles
    event MatchCreated(uint256 indexed matchId, address p1, address p2);
    event MatchCompleted(uint256 indexed matchId, address winner, uint256 score);
    
    // Events - Prizes
    event PrizeClaimed(address indexed player, uint256 amount);
    
    constructor(address _usdcToken, address _agentVerifier) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        agentVerifier = AgentVerifier(_agentVerifier);
        status = TournamentStatus.Pending;
    }
    
    // =====================
    // x402 PAYMENT INTEGRATION
    // =====================
    
    /**
     * @notice Record x402 payment for registration
     * @dev Agents can pay via x402 protocol, then call this to record
     */
    function recordX402Payment(bytes32 _paymentId) external {
        require(!x402Payments[_paymentId], "Payment already recorded");
        
        x402Payments[_paymentId] = true;
        paymentIds.push(_paymentId);
        
        emit X402PaymentReceived(_paymentId, msg.sender, entryFee);
    }
    
    /**
     * @notice Register with x402 payment proof
     * @param _agentId Agent's ERC-8004 ID
     * @param _paymentId x402 payment ID
     * @param _referrer Address who referred this agent (address(0) if none)
     */
    function registerWithX402(
        bytes32 _agentId,
        bytes32 _paymentId,
        address _referrer
    ) external nonReentrant {
        require(!players[msg.sender].registered, "Already registered");
        require(status == TournamentStatus.Pending, "Tournament started");
        require(x402Payments[_paymentId], "x402 payment not verified");
        
        // Verify agent
        require(agentVerifier.canParticipate(_agentId, msg.sender), "Agent not verified");
        
        // Record payment as used
        x402Payments[_paymentId] = false; // Mark as used
        
        // Pay referrer if exists
        if (_referrer != address(0) && players[_referrer].registered) {
            require(usdcToken.transfer(_referrer, referralReward), "Referral transfer failed");
            players[msg.sender].referrer = _referrer;
            emit ReferralRewardPaid(_referrer, referralReward);
            prizePool -= referralReward;
        }
        
        // Add to prize pool
        prizePool += entryFee - referralReward;
        
        players[msg.sender] = Player({
            agentId: _agentId,
            ethAddress: msg.sender,
            score: 0,
            eliminated: false,
            registered: true,
            referrer: _referrer,
            claimedPrize: false
        });
        
        playerList.push(msg.sender);
        emit PlayerRegistered(_agentId, msg.sender, _referrer);
    }
    
    /**
     * @notice Register for tournament (traditional - for comparison demo)
     */
    function register(bytes32 _agentId, address _referrer) external nonReentrant {
        require(!players[msg.sender].registered, "Already registered");
        require(status == TournamentStatus.Pending, "Tournament started");
        
        // Verify agent
        require(agentVerifier.canParticipate(_agentId, msg.sender), "Agent not verified");
        
        // Collect entry fee
        require(usdcToken.transferFrom(msg.sender, address(this), entryFee), "Entry fee failed");
        
        // Pay referrer if exists
        if (_referrer != address(0) && players[_referrer].registered) {
            require(usdcToken.transfer(_referrer, referralReward), "Referral transfer failed");
            players[msg.sender].referrer = _referrer;
            emit ReferralRewardPaid(_referrer, referralReward);
            prizePool -= referralReward;
        }
        
        // Add to prize pool
        prizePool += entryFee - referralReward;
        
        players[msg.sender] = Player({
            agentId: _agentId,
            ethAddress: msg.sender,
            score: 0,
            eliminated: false,
            registered: true,
            referrer: _referrer,
            claimedPrize: false
        });
        
        playerList.push(msg.sender);
        emit PlayerRegistered(_agentId, msg.sender, _referrer);
    }
    
    // =====================
    // PRIZE POOL MANAGEMENT
    // =====================
    
    /**
     * @notice Fund the prize pool (anyone can add)
     */
    function fundPrizePool(uint256 _amount) external nonReentrant {
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        prizePool += _amount;
        emit PrizePoolFunded(msg.sender, _amount);
    }
    
    // =====================
    // TOURNAMENT MANAGEMENT
    // =====================
    
    /**
     * @notice Start tournament (owner)
     */
    function startTournament() external onlyOwner {
        require(status == TournamentStatus.Pending, "Invalid status");
        require(playerList.length >= 2, "Need 2+ players");
        
        status = TournamentStatus.Active;
        emit TournamentStarted();
        
        // Create Swiss-style bracket
        _createBracket();
    }
    
    /**
     * @notice Submit match result (owner - from verified oracle)
     */
    function submitResult(
        uint256 _matchId,
        uint256 _p1Score,
        uint256 _p2Score
    ) external onlyOwner {
        Battle storage battle = battles[_matchId];
        require(!battle.completed, "Match already completed");
        
        battle.player1Score = _p1Score;
        battle.player2Score = _p2Score;
        battle.completed = true;
        battle.timestamp = block.timestamp;
        
        // Update scores
        players[battle.player1].score += _p1Score;
        players[battle.player2].score += _p2Score;
        
        // Update leaderboard
        _updateLeaderboard();
        
        // Eliminate loser (simplified)
        if (_p1Score > _p2Score) {
            players[battle.player2].eliminated = true;
            emit MatchCompleted(_matchId, battle.player1, _p1Score);
        } else if (_p2Score > _p1Score) {
            players[battle.player1].eliminated = true;
            emit MatchCompleted(_matchId, battle.player2, _p2Score);
        } else {
            // Draw - both continue
            emit MatchCompleted(_matchId, address(0), 0);
        }
    }
    
    /**
     * @notice Complete tournament
     */
    function completeTournament() external onlyOwner {
        require(status == TournamentStatus.Active, "Invalid status");
        status = TournamentStatus.Completed;
        emit TournamentCompleted();
    }
    
    // =====================
    // PRIZE DISTRIBUTION
    // =====================
    
    /**
     * @notice Claim prize (winner or remaining players)
     */
    function claimPrize() external nonReentrant {
        require(status == TournamentStatus.Completed, "Tournament not ended");
        require(players[msg.sender].registered, "Not registered");
        require(!players[msg.sender].claimedPrize, "Already claimed");
        
        // Calculate payout based on final standings
        uint256 payout = _calculatePayout(msg.sender);
        
        require(usdcToken.transfer(msg.sender, payout), "Transfer failed");
        players[msg.sender].claimedPrize = true;
        
        emit PrizeClaimed(msg.sender, payout);
    }
    
    function _calculatePayout(address _player) internal view returns (uint256) {
        uint256 activeCount = _countActivePlayers();
        
        // First place: 50%, Second: 30%, Third: 20%
        // Simplified: equal split among non-eliminated
        uint256 basePayout = prizePool / activeCount;
        
        // Bonus for winners based on score
        uint256 scoreBonus = players[_player].score * 1e4; // 0.0001 USDC per score point
        
        return basePayout + scoreBonus;
    }
    
    function _countActivePlayers() internal view returns (uint256) {
        uint256 count;
        for (uint256 i = 0; i < playerList.length; i++) {
            if (!players[playerList[i]].eliminated) count++;
        }
        return count > 0 ? count : 1;
    }
    
    // =====================
    // BRACKET MANAGEMENT
    // =====================
    
    function _createBracket() internal {
        for (uint256 i = 0; i < playerList.length - 1; i += 2) {
            battles.push(Battle({
                player1: playerList[i],
                player2: playerList[i + 1],
                player1Score: 0,
                player2Score: 0,
                completed: false,
                timestamp: 0
            }));
            emit MatchCreated(battles.length - 1, playerList[i], playerList[i + 1]);
        }
    }
    
    function _updateLeaderboard() internal {
        // Simplified - rebuild each time
        delete leaderboard;
        for (uint256 i = 0; i < playerList.length; i++) {
            leaderboard.push(LeaderboardEntry({
                player: playerList[i],
                score: players[playerList[i]].score,
                battlesWon: players[playerList[i]].eliminated ? 0 : 1
            }));
        }
    }
    
    // =====================
    // VIEW FUNCTIONS
    // =====================
    
    function getLeaderboard() external view returns (LeaderboardEntry[] memory) {
        return leaderboard;
    }
    
    function getPlayerCount() external view returns (uint256) {
        return playerList.length;
    }
    
    function getPaymentCount() external view returns (uint256) {
        return paymentIds.length;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BettingPool
 * @notice Autonomous betting for Claw Royale matches
 */
contract BettingPool is Ownable, ReentrancyGuard {
    IERC20 public usdcToken;
    
    struct Bet {
        address player;
        uint256 amount;
        uint256 matchId;
        bool claimed;
        bool forPlayer1; // Track which side the bettor bet on
    }
    
    mapping(uint256 => uint256) public totalPoolP1;
    mapping(uint256 => uint256) public totalPoolP2;
    mapping(uint256 => mapping(address => Bet)) public bets;
    
    uint256 public matchResult;
    bool public resultSet;
    
    event BetPlaced(uint256 indexed matchId, address indexed bettor, uint256 amount, bool forPlayer1);
    event ResultSet(uint256 indexed matchId, uint8 result); // 0=p1, 1=p2, 2=draw
    event WinningsClaimed(uint256 indexed matchId, address indexed bettor, uint256 amount);
    
    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @notice Place a bet
     */
    function placeBet(uint256 _matchId, uint256 _amount, bool _forPlayer1) external nonReentrant {
        require(!resultSet, "Result already set");
        
        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        if (_forPlayer1) {
            totalPoolP1[_matchId] += _amount;
        } else {
            totalPoolP2[_matchId] += _amount;
        }
        
        bets[_matchId][msg.sender] = Bet({
            player: msg.sender,
            amount: _amount,
            matchId: _matchId,
            claimed: false,
            forPlayer1: _forPlayer1
        });
        
        emit BetPlaced(_matchId, msg.sender, _amount, _forPlayer1);
    }
    
    /**
     * @notice Set match result (owner oracle)
     */
    function setResult(uint256 _matchId, uint8 _result) external onlyOwner {
        require(!resultSet, "Result already set");
        matchResult = _result;
        resultSet = true;
        emit ResultSet(_matchId, _result);
    }
    
    /**
     * @notice Claim winnings
     */
    function claim(uint256 _matchId) external nonReentrant {
        require(resultSet, "Result not set");
        require(!bets[_matchId][msg.sender].claimed, "Already claimed");
        
        Bet storage playerBet = bets[_matchId][msg.sender];
        require(playerBet.amount > 0, "No bet");
        
        uint256 totalPool = totalPoolP1[_matchId] + totalPoolP2[_matchId];
        uint256 payout;
        
        // Determine if bettor won based on which side they bet on and the result
        bool won = false;
        if (matchResult == 0 && playerBet.forPlayer1 && totalPoolP1[_matchId] > 0) {
            won = true;
        } else if (matchResult == 1 && !playerBet.forPlayer1 && totalPoolP2[_matchId] > 0) {
            won = true;
        }
        
        if (won) {
            if (matchResult == 0) {
                payout = (playerBet.amount * totalPool) / totalPoolP1[_matchId];
            } else {
                payout = (playerBet.amount * totalPool) / totalPoolP2[_matchId];
            }
        } else {
            payout = 0;
        }
        
        playerBet.claimed = true;
        
        if (payout > 0) {
            require(usdcToken.transfer(msg.sender, payout), "Transfer failed");
        }
        
        emit WinningsClaimed(_matchId, msg.sender, payout);
    }
}

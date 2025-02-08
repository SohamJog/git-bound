// Deployed at: 0xb66fbfaCE829Ae1A2269143707B3A2D41B2a5fC4

// SPDX-License-Identifier: MIT-OR-APACHE-2.0
pragma solidity ^0.8.23;

interface IContract {
    function chooseMove(uint32 player_move, address sender) external view returns (uint32);
    function updateQValue(uint32 player_move, int32 reward, address sender) external;
    function ownerOf(uint256 token_id) external view returns (address);
}

contract BattleArena {
    IContract public aiContract;

    event BattleResult(uint256 token1, uint256 token2, uint256 winner, uint8 score1, uint8 score2);

    constructor(address _aiContract) {
        aiContract = IContract(_aiContract);
    }


      
    function battle(uint256 token1, uint256 token2) external returns(uint256) {
        address player1 = aiContract.ownerOf(token1);
        address player2 = aiContract.ownerOf(token2);

        require(player1 != address(0) && player2 != address(0), "Invalid token owners");

        uint8 score1 = 0;
        uint8 score2 = 0;
        uint8 rounds = 5;

        for (uint8 i = 0; i < rounds; i++) {
            uint32 move1 = aiContract.chooseMove(i, player1);
            uint32 move2 = aiContract.chooseMove(move1, player2);

            int8 result = determineWinner(move1, move2);
            if (result == 1) {
                score1++;
            } else if (result == -1) {
                score2++;
            } 
            // Note that your ai does not train through battling
            aiContract.updateQValue(move1, 0, player1); 
            aiContract.updateQValue(move2, 0, player2);
        }

        uint256 winner = score1 > score2 ? token1 : (score2 > score1 ? token2 : 0);
        emit BattleResult(token1, token2, winner, score1, score2);
        return winner;
    }

    function determineWinner(uint32 move1, uint32 move2) internal pure returns (int8) {
        if (move1 == move2) return 0; // Draw
        if (
            (move1 == 0 && move2 == 2) ||  // Rock beats Scissors
            (move1 == 1 && move2 == 0) ||  // Paper beats Rock
            (move1 == 2 && move2 == 1)     // Scissors beats Paper
        ) {
            return 1; 
        }
        return -1; 
    }
}

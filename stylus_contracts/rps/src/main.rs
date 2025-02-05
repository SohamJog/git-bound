mod learning;
use learning::game::{Move, RPSAI};
use std::io;

fn get_player_move() -> Move {
    let mut input = String::new();
    println!("Enter move: (0) Rock, (1) Paper, (2) Scissors: ");
    io::stdin()
        .read_line(&mut input)
        .expect("Failed to read input");

    match input.trim() {
        "0" => Move::Rock,
        "1" => Move::Paper,
        "2" => Move::Scissors,
        _ => {
            println!("Invalid input! Defaulting to Rock.");
            Move::Rock
        }
    }
}

fn main() {
    let mut ai = RPSAI::new();
    let mut player_wins = 0;
    let mut ai_wins = 0;
    let mut draws = 0;

    println!("🎮 Rock-Paper-Scissors AI NFT Trainer 🎮");

    for round in 1..=20 {
        println!("\n🔥 Round {} 🔥", round);

        let player_move = get_player_move();
        let ai_move = ai.choose_move();

        println!("🤖 AI chose: {:?}", ai_move);
        println!("🧑 You chose: {:?}", player_move);

        let reward = if player_move.beats(&ai_move) {
            println!("🏆 You win!");
            player_wins += 1;
            1 // Positive reward if player wins
        } else if ai_move.beats(&player_move) {
            println!("🤖 AI wins!");
            ai_wins += 1;
            -1 // Negative reward if AI wins
        } else {
            println!("⚖️ It's a draw!");
            draws += 1;
            0 // No reward for a draw
        };

        ai.update_q_value(player_move, reward);
    }

    println!("\n🎉 Final Results 🎉");
    println!("🏆 You: {} Wins", player_wins);
    println!("🤖 AI: {} Wins", ai_wins);
    println!("⚖️ Draws: {}", draws);
}

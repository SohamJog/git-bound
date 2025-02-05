mod lib;
use lib::{Cell, Connect4, QLearning};
use std::io;

fn print_board(game: &Connect4) {
    println!("\n  0 1 2 3 4 ");
    for row in game.board.iter() {
        for cell in row {
            let symbol = match cell {
                Cell::Empty => "⚫",
                Cell::Player => "🔴",
                Cell::AI => "🟡",
            };
            print!("{} ", symbol);
        }
        println!();
    }
    println!();
}

fn main() {
    let mut ql = QLearning::new();
    let mut ai_wins = 0;
    let mut player_wins = 0;
    let mut draws = 0;

    println!("🎮 Connect 4 - AI Training Over 100 Games...");

    for game_num in 1..=100 {
        println!("▶️ Game {} - You (🔴) vs AI (🟡)", game_num);
        let mut game = Connect4::new();

        loop {
            print_board(&game);

            // Human move
            let mut input = String::new();
            println!("👉 Enter a column (0-4): ");
            io::stdin()
                .read_line(&mut input)
                .expect("Failed to read input");
            let col: usize = match input.trim().parse() {
                Ok(num) if num < 5 => num,
                _ => {
                    println!("❌ Invalid input! Enter a number between 0-4.");
                    continue;
                }
            };

            if !game.drop_piece(col, Cell::Player) {
                println!("⚠️ Column full! Try another.");
                continue;
            }

            if let Some(winner) = game.check_winner() {
                ql.train(&game);
                print_board(&game);
                match winner {
                    Cell::Player => {
                        println!("🏆 You Win!");
                        player_wins += 1;
                    }
                    Cell::AI => {
                        println!("🤖 AI Wins!");
                        ai_wins += 1;
                    }
                    _ => (),
                }
                break;
            }

            // AI Move
            let ai_move = ql.play(&game);
            println!("🤖 AI chooses column {}", ai_move);
            game.drop_piece(ai_move, Cell::AI);

            if let Some(winner) = game.check_winner() {
                print_board(&game);
                match winner {
                    Cell::Player => {
                        println!("🏆 You Win!");
                        player_wins += 1;
                    }
                    Cell::AI => {
                        println!("🤖 AI Wins!");
                        ai_wins += 1;
                    }
                    _ => (),
                }
                break;
            }

            // Train AI on the **current game state**
            ql.train(&game);
            println!("📈 AI Trained on this state!");
        }

        // Check if it's a draw
        if game.check_winner().is_none() {
            draws += 1;
        }
    }

    println!("✅ 100 Games Completed!");
    println!("📊 Results:");
    println!("🤖 AI Wins: {}", ai_wins);
    println!("🏆 Player Wins: {}", player_wins);
    println!("⚖️ Draws: {}", draws);
}

use rand::prelude::*;
use rand::thread_rng;
use rand::Rng;
use std::collections::HashMap;
use std::io;

const ROWS: usize = 5;
const COLS: usize = 5;
const ALPHA: f64 = 0.1; // Learning rate
const GAMMA: f64 = 0.9; // Discount factor
const EPSILON: f64 = 0.2; // Exploration probability

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum Cell {
    Empty,
    Player,
    AI,
}

#[derive(Clone)]
pub struct Connect4 {
    pub board: [[Cell; COLS]; ROWS],
}

impl Connect4 {
    pub fn new() -> Self {
        Self {
            board: [[Cell::Empty; COLS]; ROWS],
        }
    }

    pub fn drop_piece(&mut self, col: usize, player: Cell) -> bool {
        for row in (0..ROWS).rev() {
            if self.board[row][col] == Cell::Empty {
                self.board[row][col] = player;
                return true;
            }
        }
        false
    }

    fn get_state(&self) -> String {
        self.board
            .iter()
            .flatten()
            .map(|cell| match cell {
                Cell::Empty => "0",
                Cell::Player => "1",
                Cell::AI => "2",
            })
            .collect::<Vec<&str>>()
            .join("")
    }

    // how good is the ai doing compared to the player on a scale of -0.5 to 0.5
    pub fn fitness_function(&self) -> f64 {
        let mut ai_pieces = 0;
        let mut player_pieces = 0;
        let mut ai_near_wins = 0;
        let mut player_near_wins = 0;

        // Count AI & Player pieces
        for row in 0..ROWS {
            for col in 0..COLS {
                match self.board[row][col] {
                    Cell::AI => ai_pieces += 1,
                    Cell::Player => player_pieces += 1,
                    _ => (),
                }

                // Check near-win situations
                if self.check_near_win(row, col, Cell::AI) {
                    ai_near_wins += 1;
                }
                if self.check_near_win(row, col, Cell::Player) {
                    player_near_wins += 1;
                }
            }
        }

        // Check if game is already won
        if let Some(winner) = self.check_winner() {
            return match winner {
                Cell::AI => 0.5,      // AI wins
                Cell::Player => -0.5, // Player wins
                _ => 0.0,
            };
        }

        // Calculate fitness score
        let piece_score = (ai_pieces as f64 - player_pieces as f64) / (ROWS * COLS) as f64;
        let near_win_score = (ai_near_wins as f64 - player_near_wins as f64) / 10.0; // Normalize

        let fitness = piece_score + near_win_score;

        println!("{:?}", fitness.max(-0.5).min(0.5));
        // Clamp between -0.5 and 0.5
        fitness.max(-0.5).min(0.5)
    }

    // Helper function to check near-win situations (3 in a row)
    fn check_near_win(&self, row: usize, col: usize, player: Cell) -> bool {
        if self.board[row][col] != Cell::Empty {
            return false;
        }

        // Simulate move
        let mut temp_board = self.clone();
        temp_board.board[row][col] = player;

        temp_board.check_winner() == Some(player)
    }

    pub fn check_winner(&self) -> Option<Cell> {
        for row in 0..ROWS {
            for col in 0..COLS {
                if self.check_direction(row, col, 1, 0)
                    || self.check_direction(row, col, 0, 1)
                    || self.check_direction(row, col, 1, 1)
                    || self.check_direction(row, col, 1, -1)
                {
                    return Some(self.board[row][col]);
                }
            }
        }
        None
    }

    fn check_direction(&self, row: usize, col: usize, drow: isize, dcol: isize) -> bool {
        let start_cell = self.board[row][col];
        if start_cell == Cell::Empty {
            return false;
        }

        for i in 1..4 {
            let new_row = row as isize + i * drow;
            let new_col = col as isize + i * dcol;
            if new_row < 0 || new_row >= ROWS as isize || new_col < 0 || new_col >= COLS as isize {
                return false;
            }
            if self.board[new_row as usize][new_col as usize] != start_cell {
                return false;
            }
        }
        true
    }
}

pub struct QLearning {
    q_table: HashMap<String, [f64; COLS]>,
}

impl QLearning {
    pub fn new() -> Self {
        Self {
            q_table: HashMap::new(),
        }
    }

    pub fn train(&mut self, game: &Connect4) {
        println!("Q values: {:?}", self.q_table);
        let mut rng = thread_rng();
        let mut training_game = game.clone(); // Clone the game to avoid modifying the original
        let mut state = training_game.get_state();
        let mut done = false;

        // let init_reward = if let Some(winner) = training_game.check_winner() {
        //     match winner {
        //         Cell::AI => 1.0,
        //         Cell::Player => -1.0,
        //         _ => training_game.fitness_function(),
        //     }
        // } else {
        //     training_game.fitness_function() // Reward based on game state
        // };
        // self.update_q_value(&state, action, reward, &new_state);

        let winner = training_game.check_winner();
        if let Some(winner) = training_game.check_winner() {
            match winner {
                Cell::AI => {
                    self.update_q_value(&state, 0, 1.0, &state);
                    return;
                }
                Cell::Player => {
                    self.update_q_value(&state, 0, -1.0, &state);
                    return;
                }
                _ => {}
            }
        }

        while !done {
            let action = if rng.gen::<f64>() < EPSILON {
                rng.gen_range(0..COLS)
            } else {
                self.best_action(&state)
            };

            if training_game.drop_piece(action, Cell::AI) {
                let new_state = training_game.get_state();
                let reward = if let Some(winner) = training_game.check_winner() {
                    match winner {
                        Cell::AI => 1.0,
                        Cell::Player => -1.0,
                        _ => training_game.fitness_function(),
                    }
                } else {
                    training_game.fitness_function() // Reward based on game state
                };

                self.update_q_value(&state, action, reward, &new_state);
                state = new_state;

                if reward != 0.0 {
                    done = true;
                }
            }
        }
    }

    pub fn play(&self, game: &Connect4) -> usize {
        let state = game.get_state();
        self.best_action(&state)
    }

    fn best_action(&self, state: &str) -> usize {
        let q_values = self.q_table.get(state).unwrap_or(&[0.0; COLS]);
        q_values
            .iter()
            .enumerate()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap())
            .map(|(idx, _)| idx)
            .unwrap_or(0)
    }

    fn update_q_value(&mut self, state: &str, action: usize, reward: f64, next_state: &str) {
        println!("Updating q value with reward... {:?}", reward);
        let max_next_q = self
            .q_table
            .get(next_state)
            .map(|vals| vals.iter().cloned().fold(f64::MIN, f64::max)) // Get max Q-value
            .unwrap_or(0.0);

        let q_values = self.q_table.entry(state.to_string()).or_insert([0.0; COLS]);

        q_values[action] = (1.0 - ALPHA) * q_values[action] + ALPHA * (reward + GAMMA * max_next_q);
    }
}

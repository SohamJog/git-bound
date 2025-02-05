use std::collections::HashMap;
use rand::prelude::*;
use rand::thread_rng;
use std::io;

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum Move {
    Rock,
    Paper,
    Scissors,
}

impl Move {
    pub fn from_index(idx: usize) -> Self {
        match idx {
            0 => Move::Rock,
            1 => Move::Paper,
            _ => Move::Scissors,
        }
    }

    pub fn to_index(&self) -> usize {
        match self {
            Move::Rock => 0,
            Move::Paper => 1,
            Move::Scissors => 2,
        }
    }

    pub fn beats(&self, other: &Move) -> bool {
        matches!(
            (self, other),
            (Move::Rock, Move::Scissors) | (Move::Paper, Move::Rock) | (Move::Scissors, Move::Paper)
        )
    }
}

pub struct RPSAI {
    q_table: HashMap<Vec<Move>, [f64; 3]>, // Maps last 5 moves to Q-values
    history: Vec<Move>,
    alpha: f64,  // Learning rate
    gamma: f64,  // Discount factor
    epsilon: f64, // Exploration rate
}

impl RPSAI {
    pub fn new() -> Self {
        Self {
            q_table: HashMap::new(),
            history: vec![Move::Rock; 5], // Default history (filled with Rocks)
            alpha: 0.1,
            gamma: 0.9,
            epsilon: 0.2,
        }
    }

    pub fn choose_move(&mut self) -> Move {
        let state = self.history.clone();
        let mut rng = thread_rng();

        // Exploration vs Exploitation
        if rng.gen::<f64>() < self.epsilon {
            // Explore (random move)
            Move::from_index(rng.gen_range(0..3))
        } else {
            // Exploit (choose best Q-value move)
            let q_values = self.q_table.entry(state).or_insert([0.0; 3]);
            let best_action = q_values.iter().enumerate().max_by(|a, b| a.1.partial_cmp(b.1).unwrap()).map(|(idx, _)| idx).unwrap_or(0);
            Move::from_index(best_action)
        }
    }

    pub fn update_q_value(&mut self, player_move: Move, reward: f64) {
        println!("Q-table: {:?}", self.q_table);
        let state = self.history.clone();
        let q_values = self.q_table.entry(state).or_insert([0.0; 3]);

        let action_idx = player_move.to_index();
        let max_next_q = *q_values.iter().max_by(|a, b| a.partial_cmp(b).unwrap()).unwrap();

        // Q-learning update rule
        q_values[action_idx] += self.alpha * (reward + self.gamma * max_next_q - q_values[action_idx]);

        // Update history (remove oldest move, add new one)
        self.history.remove(0);
        self.history.push(player_move);
    }
}

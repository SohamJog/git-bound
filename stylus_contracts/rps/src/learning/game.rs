use std::collections::HashMap;
use std::io;

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum Move {
    Rock,
    Paper,
    Scissors,
}

impl Move {
    pub fn from_index(idx: u32) -> Self {
        match idx {
            0 => Move::Rock,
            1 => Move::Paper,
            _ => Move::Scissors,
        }
    }

    pub fn to_index(&self) -> u32 {
        match self {
            Move::Rock => 0,
            Move::Paper => 1,
            Move::Scissors => 2,
        }
    }

    pub fn beats(&self, other: &Move) -> bool {
        matches!(
            (self, other),
            (Move::Rock, Move::Scissors)
                | (Move::Paper, Move::Rock)
                | (Move::Scissors, Move::Paper)
        )
    }
}

pub struct RPSAI {
    q_table: HashMap<[Move; 5], [i32; 3]>, // Q-values stored as integers
    history: [Move; 5],                    // Last 5 moves for state tracking
    epsilon: u32,                          // Exploration rate (scaled 0-100)
    alpha: u32,                            // Learning rate (scaled 0-100)
    gamma: u32,                            // Discount factor (scaled 0-100)
    rng_seed: u32,                         // Random seed for deterministic randomness
}

impl RPSAI {
    pub fn new() -> Self {
        Self {
            q_table: HashMap::new(),
            history: [Move::Rock; 5], // Default state (5 rocks)
            epsilon: 20,              // 20% exploration
            alpha: 10,                // Learning rate 0.1 (scaled x100)
            gamma: 90,                // Discount factor 0.9 (scaled x100)
            rng_seed: 42,             // Initial seed
        }
    }

    pub fn choose_move(&mut self) -> Move {
        let state = self.history;
        let (rand_val, new_seed) = Self::pseudo_random(self.rng_seed);
        self.rng_seed = new_seed;

        // Exploration vs Exploitation
        if rand_val < self.epsilon {
            // Explore (choose random move)
            let (random_idx, new_seed) = Self::pseudo_random(self.rng_seed);
            self.rng_seed = new_seed;
            return Move::from_index(random_idx % 3);
        }

        // Exploit (Choose best Q-value move)
        let q_values = self.q_table.entry(state).or_insert([0; 3]);
        let mut best_action = Move::Rock;
        let mut best_val = q_values[0];

        for i in 1..3 {
            if q_values[i] > best_val {
                best_val = q_values[i];
                best_action = Move::from_index(i as u32);
            }
        }
        best_action
    }

    pub fn update_q_value(&mut self, player_move: Move, reward: i32) {
        println!("Q values: {:?}", self.q_table);
        let state = self.history;
        let q_values = self.q_table.entry(state).or_insert([0; 3]);

        let action_idx = player_move.to_index() as usize;
        let max_next_q = *q_values.iter().max().unwrap_or(&0);

        // Q-learning update: Q(s, a) = Q(s, a) + α * (reward + γ * max(Q(s', a')) - Q(s, a))
        let delta = reward * 100 + (self.gamma as i32 * max_next_q) / 100 - q_values[action_idx];
        q_values[action_idx] += (self.alpha as i32 * delta) / 100;

        // Shift history to store the latest 5 moves
        self.history.rotate_left(1);
        self.history[4] = player_move;
    }

    // Deterministic pseudo-random function for Stylus
    pub fn pseudo_random(seed: u32) -> (u32, u32) {
        let a: u32 = 1664525;
        let c: u32 = 1013904223;
        let new_seed = seed.wrapping_mul(a).wrapping_add(c);
        let random = new_seed % 100;
        (random, new_seed)
    }
}

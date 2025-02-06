pub mod learning;
// pub use learning::game::RPSAI;
pub use learning::game::Move;

// Allow `cargo stylus export-abi` to generate a main function.
// TODO: Un-comment
//#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

/// Import items from the SDK. The prelude contains common traits and macros.
use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, I32, U256, U32},
    prelude::*,
};
use stylus_sdk::{alloy_sol_types::sol, evm};

use core::ops::Deref;
use std::fmt;
use std::fmt::Write;
use stylus_sdk::storage::{StorageAddress, StorageArray, StorageI32, StorageMap, StorageU32};

const HISTORY_SIZE: usize = 5;

const fn pow3(exp: usize) -> usize {
    let mut result = 1;
    let mut i = 0;
    while i < exp {
        result *= 3;
        i += 1;
    }
    result
}

const Q_TABLE_SIZE: usize = pow3(HISTORY_SIZE);

sol! {
  event TrainingCompleted();
}

#[entrypoint]
#[storage]

pub struct Contract {
    /// The owner (if minted).
    owner: StorageAddress,
    /// The maze state (Q‑table).
    //q_table: StorageArray<StorageArray<StorageArray<StorageI32, ACTION_COUNT>, MAZE_SIZE>, MAZE_SIZE>,
    //q_table: StorageArray<StorageI32, Q_TABLE_SIZE>,
    /// A counter used for RNG seeding.
    // TODO figure out encoding for indices
    // q_table:  StorageArray<StorageI32, Q_TABLE_SIZE>,
    q_table: StorageMap<u32, StorageArray<StorageI32, 3>>,
    history: StorageArray<StorageI32, HISTORY_SIZE>,
    epsilon: StorageU32,
    alpha: StorageU32,
    gamma: StorageU32,
    rng_seed: StorageU32,
}

/// Start of our contract public functions.
#[public]
impl Contract {
    pub fn supports_interface(&self, interface: FixedBytes<4>) -> bool {
        let interface_slice_array: [u8; 4] = interface.as_slice().try_into().unwrap();
        // Convert interface_id to u32 for easier comparison
        let id = u32::from_be_bytes(interface_slice_array);

        // Compare with known interface IDs
        id == 0x01ffc9a7 || // ERC-165
        id == 0x80ac58cd || // ERC-721
        id == 0x5b5e139f // ERC-721Metadata
    }

    /// Mint the single token
    pub fn mint(&mut self, to: Address) {
        self.owner.set(to);
        self.rng_seed.set(U32::from(42));
        self.epsilon.set(U32::from(20));
        self.alpha.set(U32::from(10));
        self.gamma.set(U32::from(90));
    }

    pub fn symbol(&self) -> String {
        "PODRPS".to_string()
    }

    pub fn name(&self) -> String {
        "Proof-of-Defeat Rock Paper Scissor NFT".to_string()
    }

    pub fn description(&self) -> String {
        "Your ultimate enemy in Rock-Paper-Scissors.".to_string()
    }

    // TODO: Eventually have functionality for owning multiple tokens
    pub fn balance_of(&self, owner: Address) -> U256 {
        if owner == self.owner.get() {
            U256::from(1)
        } else {
            U256::from(0)
        }
    }

    pub fn owner_of(&self, token_id: U256) -> Result<Address, Vec<u8>> {
        // Since we only have one token, check if token_id is 1
        if token_id != U256::from(1) {
            return Err("Invalid token ID".as_bytes().to_vec());
        }

        // Get the owner address
        let owner = self.owner.get();

        // Check if the token has been minted
        if owner == Address::ZERO {
            return Err("Token not minted".as_bytes().to_vec());
        }

        Ok(owner)
    }

    pub fn choose_move(&mut self) -> U32 {
        let state_key = Self::encode_state(&self.history) as u32;
        let (rand_val, new_seed) = Self::pseudo_random(self.rng_seed.get().to::<u32>());
        self.rng_seed.set(U32::from(new_seed));

        if rand_val < self.epsilon.get().to::<u32>() {
            let (random_idx, new_seed) = Self::pseudo_random(self.rng_seed.get().to::<u32>());
            self.rng_seed.set(U32::from(new_seed));
            return U32::from(random_idx % 3); // Random move (0,1,2)
        }

        // // Fetch or initialize Q-values
        // let mut q_values = self
        //     .q_table
        //     .get(state_key).1;
        //     //.or_insert([StorageI32::from(0); 3]);

        let stored_q_values = self.q_table.get(state_key); // StorageGuard<StorageArray<StorageI32, 3>>

        // Correct way to access StorageArray elements
        let q_values: [i32; 3] = [
            stored_q_values.deref().get(0).unwrap().as_i32(),
            stored_q_values.deref().get(1).unwrap().as_i32(),
            stored_q_values.deref().get(2).unwrap().as_i32(),
        ];

        let mut best_action = 0;
        let mut best_val = q_values[0];

        for i in 1..3 {
            if q_values[i] > best_val {
                best_val = q_values[i];
                best_action = i as u32;
            }
        }
        U32::from(best_action) // Return best move as U32
    }

    pub fn update_q_value(&mut self, player_move: U32, reward: I32) {
        let state_key = Self::encode_state(&self.history) as u32;
        // let mut q_values = self.q_table.get(state_key).1;
        // .or_insert([StorageI32::from(0); 3]);

        let stored_q_values = self.q_table.get(state_key); // StorageGuard<StorageArray<StorageI32, 3>>

        // Correct way to access StorageArray elements
        let q_values: [i32; 3] = [
            stored_q_values.deref().get(0).unwrap().as_i32(),
            stored_q_values.deref().get(1).unwrap().as_i32(),
            stored_q_values.deref().get(2).unwrap().as_i32(),
        ];

        let action_idx = player_move.to();
        let max_next_q = q_values.iter().map(v).max().unwrap_or(0);

        let alpha = self.alpha.get().to::<i32>();
        let gamma = self.gamma.get().to::<i32>();

        //let delta = reward.into::<i32>() * 100 + (gamma * max_next_q) / 100 - q_values[action_idx];
        let delta = reward.into() * 100 + (gamma * max_next_q) / 100 - q_values[action_idx];
        q_values[action_idx].set(q_values[action_idx] + (alpha * delta) / 100);

        // Shift history & update
        for i in 0..(HISTORY_SIZE - 1) {
            self.history[i].set(self.history[i + 1].get());
        }
        self.history[HISTORY_SIZE - 1].set(player_move.to());
    }

    // pub fn get_qtable(&self, ) -> [i32; Q_TABLE_SIZE] {

    // }
}

// private functions
// TODO: have functions for q value index encoding etc.

impl Contract {
    fn pseudo_random(seed: u32) -> (u32, u32) {
        let a: u32 = 1664525;
        let c: u32 = 1013904223;
        let new_seed = seed.wrapping_mul(a).wrapping_add(c);
        let random = new_seed % 100;
        (random, new_seed)
    }

    fn encode_state(history: &StorageArray<StorageI32, HISTORY_SIZE>) -> u32 {
        let mut state = 0u32;
        for (i, move_value) in history.iter().enumerate() {
            state += move_value.get() as u32 * 3u32.pow(i as u32);
        }
        state
    }
}

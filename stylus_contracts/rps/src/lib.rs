// Allow `cargo stylus export-abi` to generate a main function.
// TODO: Un-comment
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
extern crate alloc;

pub mod learning;
// pub use learning::game::RPSAI;
pub use learning::game::Move;

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
    owner: StorageAddress,
    q_table: StorageMap<u32, StorageMap<u32, StorageI32>>,
    history: StorageMap<u32, StorageU32>,
    epsilon: StorageU32,
    alpha: StorageU32,
    gamma: StorageU32,
    rng_seed: StorageU32,
}

#[public]
impl Contract {
    pub fn supports_interface(&self, interface: FixedBytes<4>) -> bool {
        let interface_slice_array: [u8; 4] = interface.as_slice().try_into().unwrap();
        let id = u32::from_be_bytes(interface_slice_array);

        id == 0x01ffc9a7 || // ERC-165
        id == 0x80ac58cd || // ERC-721
        id == 0x5b5e139f // ERC-721Metadata
    }

    pub fn mint(&mut self, to: Address) {
        // Ensure the contract hasn't been initialized yet
        if self.owner.get() != Address::ZERO {
            return;
        }

        self.owner.set(to);
        self.rng_seed.set(U32::from(42));
        self.epsilon.set(U32::from(20));
        self.alpha.set(U32::from(10));
        self.gamma.set(U32::from(90));

        // Initialize history with zeros
        for i in 0..HISTORY_SIZE {
            self.history.setter(i as u32).set(U32::from(0));
        }

        // Initialize Q-table with small random values for initial exploration
        let mut current_seed = 42u32;
        for state in 0..Q_TABLE_SIZE {
            let mut state_map = self.q_table.setter(state as u32);
            for action in 0..3 {
                let (rand_val, new_seed) = Self::pseudo_random(current_seed);
                current_seed = new_seed;
                // Initialize with small random values between -10 and 10
                let small_random = I32::try_from((rand_val as i32 % 21) - 10).unwrap();
                state_map.setter(action).set(small_random);
            }
        }
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

    pub fn balance_of(&self, owner: Address) -> U256 {
        if owner == self.owner.get() {
            U256::from(1)
        } else {
            U256::from(0)
        }
    }

    pub fn owner_of(&self, token_id: U256) -> Result<Address, Vec<u8>> {
        if token_id != U256::from(1) {
            return Err("Invalid token ID".as_bytes().to_vec());
        }

        let owner = self.owner.get();

        if owner == Address::ZERO {
            return Err("Token not minted".as_bytes().to_vec());
        }

        Ok(owner)
    }

    pub fn choose_move(&self, player_move: U32) -> U32 {
        // Ensure player_move is valid (0, 1, or 2)

        if player_move.to::<u32>() > 2 {
            return U32::from(0);
        }
        // Default to a random move initially
        let (random_move, _) = Self::pseudo_random(self.rng_seed.get().to::<u32>());
        let default_move = U32::from(random_move % 3);

        // Calculate state key
        let state_key = Self::encode_state(
            self.history.get(1).to::<u32>() % 3,
            self.history.get(2).to::<u32>() % 3,
            self.history.get(3).to::<u32>() % 3,
            self.history.get(4).to::<u32>() % 3,
            player_move.to::<u32>() % 3,
        ) as u32;

        // Check if contract is initialized (owner is set)
        // TODO: moe above afterwards
        if self.owner.get() == Address::ZERO {
            return default_move;
        }

        // Random exploration with epsilon probability
        let (rand_val, _) = Self::pseudo_random(self.rng_seed.get().to::<u32>());
        if rand_val < self.epsilon.get().to::<u32>() {
            return default_move;
        }

        // // Get Q-values for current state
        // let q_values = self.q_table.get(state_key);
        // let mut best_action = 0;
        // let mut best_val = q_values.get(0);

        // // Find action with highest Q-value
        // for i in 1..3 {
        //     let current_val = q_values.get(i);
        //     if current_val > best_val {
        //         best_val = current_val;
        //         best_action = i as u32;
        //     }
        // }

        let mut best_action = 0;
        let mut best_val = I32::try_from(-200).unwrap();

        for action in 0..3 {
            let current_val = self.get_q_value(state_key, action);
            if best_val > current_val {
                best_action = action;
            }
        }

        U32::from(best_action)
    }

    pub fn update_q_value(&mut self, player_move: U32, reward: I32) {
        let state_key = Self::encode_state(
            self.history.get(0).to::<u32>(),
            self.history.get(1).to::<u32>(),
            self.history.get(2).to::<u32>(),
            self.history.get(3).to::<u32>(),
            self.history.get(4).to::<u32>(),
        ) as u32;
        let q_values = self.q_table.get(state_key);

        let mut max_next_q = 0;
        for i in 0..3 {
            if q_values.get(i).as_i32() > max_next_q {
                max_next_q = q_values.get(i).as_i32();
            }
        }

        let action_idx: u32 = player_move.to();

        let alpha = self.alpha.get().to::<i32>();
        let gamma = self.gamma.get().to::<i32>();

        let delta =
            reward.as_i32() * 100 + (gamma * max_next_q) / 100 - q_values.get(action_idx).as_i32();

        let set_value =
            I32::try_from(q_values.get(action_idx).as_i32() + (alpha * delta) / 100).unwrap();

        self.q_table
            .setter(state_key)
            .setter(action_idx)
            .set(set_value);

        let first = self.history.get(1);
        let second = self.history.get(2);
        let third = self.history.get(3);
        let fourth = self.history.get(4);
        let fifth = player_move;
        self.history.setter(0).set(first);
        self.history.setter(1).set(second);
        self.history.setter(2).set(third);
        self.history.setter(3).set(fourth);
        self.history.setter(4).set(fifth);
    }

    pub fn get_history(&self) -> [U32; HISTORY_SIZE] {
        [
            self.history.get(0),
            self.history.get(1),
            self.history.get(2),
            self.history.get(3),
            self.history.get(4),
        ]
    }

    #[selector(name = "tokenURI")]
    pub fn token_uri(&self, _token_id: U256) -> String {
        let mut uri = String::new();
        write!(
            uri,
            "https://api.dicebear.com/9.x/croodles/svg?seed={}{}",
            self.owner.get(),
            self.balance_of(self.owner.get())
        )
        .unwrap();
        uri
    }

    pub fn encode_state(first: u32, second: u32, third: u32, fourth: u32, fifth: u32) -> u32 {
        let mut state = 0u32;
        state += first * 3u32.pow(0);
        state += second * 3u32.pow(1);
        state += third * 3u32.pow(2);
        state += fourth * 3u32.pow(3);
        state += fifth * 3u32.pow(4);
        state
    }

    pub fn get_q_value(&self, state: u32, action: u32) -> I32 {
        if state >= Q_TABLE_SIZE as u32 || action >= 3 {
            return I32::try_from(0).unwrap();
        }
        self.q_table.get(state).get(action)
    }
}

impl Contract {
    fn pseudo_random(seed: u32) -> (u32, u32) {
        let a: u32 = 1664525;
        let c: u32 = 1013904223;
        let new_seed = seed.wrapping_mul(a).wrapping_add(c);
        let random = new_seed % 100;
        (random, new_seed)
    }
}
/*

project metadata hash computed on deployment: "d91e49926b2ecb1242158fd598fdf3b73a345456b1a6cff30a40dff1eb4687ac"
stripped custom section from user wasm to remove any sensitive data
contract size: 14.2 KB
wasm data fee: 0.000098 ETH (originally 0.000081 ETH with 20% bump)
deployed code at address: 0xfbfe72c3001804c7e3d36c4604904339074f5a60
deployment tx hash: 0x31ada7a89847094f8ffa7cea6356e1297fc95a628ff38fb64d550b151dbabbe9
contract activated and ready onchain with tx hash: 0x9d40afc3adf9c60945d3c917f6237317ba9e26d8cc42179b1f1b6a5b05373114
*/

/*
DEVNET CONTRACT:
stripped custom section from user wasm to remove any sensitive data
contract size: 14.2 KB
wasm size: 41.4 KB
File used for deployment hash: ./Cargo.lock
File used for deployment hash: ./Cargo.toml
File used for deployment hash: ./rust-toolchain.toml
File used for deployment hash: ./src/learning/game.rs
File used for deployment hash: ./src/learning/mod.rs
File used for deployment hash: ./src/lib.rs
File used for deployment hash: ./src/main.rs
project metadata hash computed on deployment: "2a92f8be8dd994d1dc2a00daf8291d2a99e9014c1e5b3a16f39620d1fd9862b5"
stripped custom section from user wasm to remove any sensitive data
contract size: 14.2 KB
wasm data fee: 0.000098 ETH (originally 0.000081 ETH with 20% bump)
deployed code at address: 0xa6e41ffd769491a42a6e5ce453259b93983a22ef
deployment tx hash: 0x07d4ffe31a8ffeacc92cc2dfc9110531aa6ca793c1c9e8f1f55b73a5855225e7
contract activated and ready onchain with tx hash: 0x15c7f12af867410020d42d799e196a7be8eb4b2d34d84398e8e3bfd71e934fbe
*/

// 0xa6e41ffd769491a42a6e5ce453259b93983a22ef

// 0x4af567288e68cad4aa93a272fe6139ca53859c70

// 0xf5ffd11a55afd39377411ab9856474d2a7cb697e

// 0xdb2d15a3eb70c347e0d2c2c7861cafb946baab48

// FINAL CONTRACT ADDRESS (WITHOUT PLAY):
// 0x027d8146efa681dcfc8a6058a32d4577746df9c0

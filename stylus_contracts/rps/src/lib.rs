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
const rng_seed: u32 = 42;
const epsilon: u32 = 20;
const alpha: u32 = 10;
const gamma: u32 = 90;

sol! {
    event TrainingCompleted();
}

#[entrypoint]
#[storage]
pub struct Contract {
    nft_owners: StorageMap<U256, StorageAddress>, // tokenId -> owner
    owner_to_token: StorageMap<Address, StorageU32>,
    q_table: StorageMap<Address, StorageMap<u32, StorageMap<u32, StorageI32>>>, // user -> state -> action -> q-value
    history: StorageMap<Address, StorageMap<u32, StorageU32>>, // user -> last 5 moves
    total_supply: StorageU32,                                  // Keeps track of token count
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

    pub fn mint(&mut self, to: Address) -> U256 {
        let token_id = self.total_supply.get().to::<u32>() + 1;

        self.nft_owners.setter(U256::from(token_id)).set(to);
        self.total_supply.set(U32::from(token_id));
        self.owner_to_token.setter(to).set(U32::from(token_id));

        // Initialize history with zeros
        let mut history = self.history.setter(to);
        for i in 0..HISTORY_SIZE {
            history.setter(i as u32).set(U32::from(0));
        }

        // Initialize Q-table
        let mut current_seed = 42u32;
        let mut user_q_table = self.q_table.setter(to);
        for state in 0..Q_TABLE_SIZE {
            let mut state_map = user_q_table.setter(state as u32);
            for action in 0..3 {
                let (rand_val, new_seed) = Self::pseudo_random(current_seed);
                current_seed = new_seed;
                let small_random = I32::try_from((rand_val as i32 % 21) - 10).unwrap();
                state_map.setter(action).set(small_random);
            }
        }

        U256::from(token_id)
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
        if self.owner_to_token.get(owner) == U32::from(0) {
            return U256::from(0);
        }
        return U256::from(1);
    }

    // pub fn owner_of(&self, token_id: U256) -> Result<Address, Vec<u8>> {
    //     if token_id != U256::from(1) {
    //         return Err("Invalid token ID".as_bytes().to_vec());
    //     }

    //     let owner = self.owner.get();

    //     if owner == Address::ZERO {
    //         return Err("Token not minted".as_bytes().to_vec());
    //     }

    //     Ok(owner)
    // }

    pub fn choose_move(&self, player_move: U32, sender: Address) -> U32 {
        // Ensure valid player move (0,1,2)
        if player_move.to::<u32>() > 2 {
            return U32::from(0);
        }

        let history = self.history.get(sender);
        let state_key = Self::encode_state(
            history.get(0).to::<u32>(),
            history.get(1).to::<u32>(),
            history.get(2).to::<u32>(),
            history.get(3).to::<u32>(),
            player_move.to::<u32>(),
        );

        // Random exploration
        let (rand_val, _) = Self::pseudo_random(rng_seed);
        if rand_val < epsilon {
            return U32::from(rand_val % 3);
        }

        let q_table = self.q_table.get(sender);
        let mut best_action = 0;
        let mut best_val = I32::try_from(-200).unwrap();

        for action in 0..3 {
            let current_val = q_table.get(state_key).get(action);
            if current_val > best_val {
                best_action = action;
                best_val = current_val;
            }
        }

        U32::from(best_action)
    }

    pub fn update_q_value(&mut self, player_move: U32, reward: I32, sender: Address) {
        let history = self.history.get(sender);

        let state_key = Self::encode_state(
            history.get(0).to::<u32>(),
            history.get(1).to::<u32>(),
            history.get(2).to::<u32>(),
            history.get(3).to::<u32>(),
            history.get(4).to::<u32>(),
        );

        let q_table = self.q_table.get(sender);
        let mut max_next_q = I32::try_from(0).unwrap();
        for i in 0..3 {
            let val = q_table.get(state_key).get(i);
            if val > max_next_q {
                max_next_q = val;
            }
        }

        let action_idx: u32 = player_move.to();

        let delta = reward.as_i32() * 100 + (gamma as i32 * max_next_q.as_i32()) / 100
            - q_table.get(state_key).get(action_idx).as_i32();

        let qstate = I32::try_from(
            q_table.get(state_key).get(action_idx).as_i32() + (alpha as i32 * delta as i32) / 100,
        )
        .unwrap();
        self.q_table
            .setter(sender)
            .setter(state_key)
            .setter(action_idx)
            .set(qstate);

        let mut user_history = self.history.setter(sender);

        let first = user_history.get(1);
        let second = user_history.get(2);
        let third = user_history.get(3);
        let fourth = user_history.get(4);
        let fifth = player_move;

        user_history.setter(0).set(first);
        user_history.setter(1).set(second);
        user_history.setter(2).set(third);
        user_history.setter(3).set(fourth);
        user_history.setter(4).set(player_move);
    }

    pub fn get_history(&self, user: Address) -> [U32; HISTORY_SIZE] {
        let history = self.history.get(user);
        [
            history.get(0),
            history.get(1),
            history.get(2),
            history.get(3),
            history.get(4),
        ]
    }

    // #[selector(name = "tokenURI")]
    // pub fn token_uri(&self, _token_id: U256) -> String {
    //     let mut uri = String::new();
    //     write!(
    //         uri,
    //         "https://api.dicebear.com/9.x/croodles/svg?seed={}{}",
    //         self.owner.get(),
    //         self.balance_of(self.owner.get())
    //     )
    //     .unwrap();
    //     uri
    // }
    #[selector(name = "tokenURI")]
    pub fn token_uri(&self, _token_id: U256) -> String {
        let owner = self.nft_owners.get(_token_id);
        let mut uri = String::new();
        let image_url = format!(
            // "https://api.dicebear.com/9.x/croodles/svg?seed={}{}",
            //"https://api.dicebear.com/9.x/croodles/png?seed={}{}",
            "https://api.dicebear.com/9.x/croodles/svg?seed={:?}{}#svg",
            owner, _token_id
        );

        let metadata = format!(
            "{{\"name\":\"Proof-of-Defeat Rock Paper Scissor NFT\",\"description\":\"Your ultimate enemy in Rock-Paper-Scissors.\",\"image\":\"{}\"}}",
            image_url
        );

        write!(
            uri,
            "data:application/json;base64,{}",
            Self::base64_encode(metadata.as_bytes())
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

    pub fn get_q_value(&self, user: Address, state: u32, action: u32) -> I32 {
        self.q_table.get(user).get(state).get(action)
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

    // Base64 encoding helper function
    fn base64_encode(input: &[u8]) -> String {
        const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let mut result = String::with_capacity((input.len() + 2) / 3 * 4);

        for chunk in input.chunks(3) {
            let b = match chunk.len() {
                3 => ((chunk[0] as u32) << 16) | ((chunk[1] as u32) << 8) | (chunk[2] as u32),
                2 => ((chunk[0] as u32) << 16) | ((chunk[1] as u32) << 8),
                1 => (chunk[0] as u32) << 16,
                _ => unreachable!(),
            };

            // Convert to base64 characters
            result.push(ALPHABET[(b >> 18 & 0x3F) as usize] as char);
            result.push(ALPHABET[(b >> 12 & 0x3F) as usize] as char);

            if chunk.len() > 1 {
                result.push(ALPHABET[(b >> 6 & 0x3F) as usize] as char);
            } else {
                result.push('=');
            }

            if chunk.len() > 2 {
                result.push(ALPHABET[(b & 0x3F) as usize] as char);
            } else {
                result.push('=');
            }
        }

        result
    }
}
/*

cargo stylus deploy \   --endpoint='https://sepolia-rollup.arbitrum.io/rpc' \ --private-key=""


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

//  CONTRACT ADDRESS (WITHOUT PLAY):
// 0xC0f973971051BDB6892ffFDa7AD211B4DCB9C0a7

// USING PNG: 0x80e39270be5cf5c135579163a57793deeb2e5d08

// USING SVG: 0xbf1cc808b59ea20301d5f47ffe9b67cef93680f9


// CONTRACT ADDRESS (MULTIPlE NFT OWNERS): 0x37e4eaadd0e68a91ea02ff482bb91889e90ee331

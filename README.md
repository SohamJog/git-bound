# Proof of Defeat

## A fully-on-chain self-learning NFT that trains against you, adapts to your playstyle, and evolves into your ultimate rival.

---
Hackathon submission [here](https://ethglobal.com/showcase/proof-of-defeat-5oe2z). Live Demo [here](https://proof-of-defeat.vercel.app/).
---

Proof of Defeat (PoD) is a fully on-chain reinforcement learning framework that enables NFTs to learn and adapt through user interactions. Using Q-learning, each NFT maintains a state-action table, adjusting its strategy based on past games. Unlike static NFTs, PoD NFTs dynamically evolve, becoming personalized AI opponents.

## Problem
1. AI Doesn’t exist fully on-chain: On-chain agents call centralized APIs like OpenAI
3. NFTs today are static assets: There is no real on-chain personalization where an NFT adapts dynamically based on user interaction

## Proof of Defeat

Proof of Defeat introduces AI Personalization for Gaming NFTs. NFTs learn and evolve based on how you play against them. Over time, your NFT is not just a digital asset, but a model of your strategy and play-style. Every NFT develops a unique strategy, and its strength is directly correlated with your skill level

## Example: Rock Paper Scissors

As a proof of concept, I have made a rock paper scissors NFT, as [humans exhibit behavioral biases](https://www.jcepm.com/article_104442_336761f3c9cf58702e352cc3d8d5ab20.pdf), making them [exploitable by reinforcement learning](https://medium.com/towards-data-science/a-beginners-guide-to-reinforcement-learning-using-rock-paper-scissors-and-tensorflow-js-37d42b6197b5). 

I use Q-Learning as a learning technique for the NFT. It's a State-Action based reinforcement learning method. I use an ε-Greedy to provide randomness and balances exploration and exploitation.

<img width="415" alt="Screenshot 2025-02-09 at 10 45 03 AM" src="https://github.com/user-attachments/assets/032bc2ed-f842-41dd-8ab2-a6f16ee57b27" />

![rl-formulation](https://github.com/user-attachments/assets/790dea69-bb83-4c77-b33d-6bcbfa0c47e3)

## Competing 
You can compete against other NFTs of the same game. 

## Add your own games
The Battle Smart-Contract calls an interface which requires 3 functions: `updateQValue()`, `chooseMove()`, and `ownerOf()`. Developers can add their own games and learning techniques and deploy them. 

---
# Repository Structure
This is a next.js app using the app router. Most of the ui functions are in the `src` folder. There are smart contract utils calling ethers.js functions in `src/lib/` calling the RPS contract and the battle contract respectively. 

The `rps` folder contains the logic for a basic Q-learning algorithm in rust for Rock-Paper-Scissors. 

The `proof-of-defeat` folder contains the code for the proof-of-defeat [subgraph](https://thegraph.com/studio/subgraph/proof-of-defeat/). This calls the events in the battle smart contract to get data about previous winners and the best performing NFTs. 

The `stylus_contracts` contains the smart contracts. The RPS contract written in rust is in the `stylus_contracts/rps/src` folder. The battle contract written in Solidity is in the folder. 
The RPS contract and the battle contract are uploaded on the Arbitrum Sepolia testnet with addresses `0x28f676127f615f80fcfc34d9459997d4c17bb475` and `0xb66fbfaCE829Ae1A2269143707B3A2D41B2a5fC4` respectively. 



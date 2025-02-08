import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x2f670C6b1FD1Cb373cd1f13F23b5505f315ff4B4";
// export const ARBITRUM_CONTRACT = "0xC0f973971051BDB6892ffFDa7AD211B4DCB9C0a7";
export const ARBITRUM_CONTRACT = "0x37e4eaadd0e68a91ea02ff482bb91889e90ee331";

export const ABI = [
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "_interface",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "player_move",
        type: "uint32",
      },
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "chooseMove",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "player_move",
        type: "uint32",
      },
      {
        internalType: "int32",
        name: "reward",
        type: "int32",
      },
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "updateQValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getHistory",
    outputs: [
      {
        internalType: "uint32[5]",
        name: "",
        type: "uint32[5]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_token_id",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "first",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "second",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "third",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "fourth",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "fifth",
        type: "uint32",
      },
    ],
    name: "encodeState",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "state",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "action",
        type: "uint32",
      },
    ],
    name: "getQValue",
    outputs: [
      {
        internalType: "int32",
        name: "",
        type: "int32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

/**
 * Connect to MetaMask with better error handling
 */

export const connectWallet = async (
  setWalletAddress,
  setConnecting,
  onWalletConnected,
  setUserAddress
) => {
  try {
    let signer = null;
    let provider;

    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
      provider = ethers.getDefaultProvider();
    } else {
      setConnecting(true);
      provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      signer = await provider.getSigner();
    }

    const address = await signer.getAddress();
    setWalletAddress(address);
    setUserAddress(address);
    onWalletConnected(signer); // Pass signer to parent component
  } catch (error) {
    console.error("Wallet connection failed:", error);
    alert(
      "Failed to connect wallet. Ensure MetaMask is installed and unlocked."
    );
  } finally {
    setConnecting(false);
  }
};

// /**
//  * Mints an SBT with skill metadata
//  */
// export async function mintSBT(userSkillsJSON) {
//   try {
//     const signer = await connectWallet();
//     const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

//     const userAddress = await signer.getAddress();
//     const metadataURI = `data:application/json;base64,${btoa(
//       JSON.stringify(userSkillsJSON)
//     )}`;

//     const tx = await contract.mint(userAddress, metadataURI);
//     await tx.wait();

//     console.log("SBT Minted:", tx);
//     return tx;
//   } catch (error) {
//     console.error("Minting Failed:", error);
//     alert("Transaction failed. Make sure you have enough gas fees.");
//     throw error;
//   }
// }

/**
 * Calls the mint function in the contract
 * @param {string} userAddress
 */

export async function mint(signer, userAddress, setMinting) {
  try {
    setMinting(true); // Start minting
    const contract = new ethers.Contract(ARBITRUM_CONTRACT, ABI, signer);

    const tx = await contract.mint(userAddress);
    await tx.wait();

    console.log("Token Minted:", tx);
    return tx;
  } catch (error) {
    console.error("Minting Failed:", error);
    alert(
      "Transaction failed. Make sure you have enough gas fees and that you are on the Arbitrum Sepolia network."
    );
    throw error;
  } finally {
    setMinting(false); // Stop minting
  }
}

/**
 * Calls the getBalance function in the contract
 */

export async function getBalance(signer) {
  try {
    const contract = new ethers.Contract(ARBITRUM_CONTRACT, ABI, signer);
    const balance = await contract.balanceOf(await signer.getAddress());

    console.log("Balance:", balance);
    return balance;
  } catch (error) {
    console.error("Balance Failed:", error);
    throw error;
  }
}

/**
 * Calls the chooseMove function in the contract
 */

export async function chooseMove(signer, playerMove) {
  try {
    const contract = new ethers.Contract(ARBITRUM_CONTRACT, ABI, signer);

    const tx = await contract.chooseMove(playerMove);

    console.log("Move Chosen:", tx);
    return tx;
  } catch (error) {
    console.error("Move Failed:", error);
    alert("Transaction failed. Make sure you have enough gas fees.");
    throw error;
  }
}

/**
 * Calls the updateQValue function in the contract
 */
export async function updateQValue(signer, playerMove, reward) {
  try {
    const contract = new ethers.Contract(ARBITRUM_CONTRACT, ABI, signer);

    const tx = await contract.updateQValue(playerMove, reward);
    const receipt = await signer.provider.waitForTransaction(tx.hash);

    console.log("QValue Updated:", receipt);
    return receipt;
  } catch (error) {
    console.error("Update Failed:", error);
    alert("Transaction failed. Make sure you have enough gas fees.");
    throw error;
  }
}

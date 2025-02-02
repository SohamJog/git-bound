const hre = require("hardhat");

async function main() {
  const SoulboundToken = await hre.ethers.getContractFactory("SoulboundToken");
  const contract = await SoulboundToken.deploy();
  await contract.deployed();

  console.log("SoulboundToken deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

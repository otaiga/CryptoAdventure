// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const StoryLibrary = await ethers.getContractFactory("StoryLibrary");
  const Collectibles = await ethers.getContractFactory("Collectibles");

  const storyLibrary = await StoryLibrary.deploy();
  await storyLibrary.deployed();
  console.log("StoryLibrary deployed to:", storyLibrary.address);

  const collectibles = await Collectibles.deploy(storyLibrary.address);
  await collectibles.deployed();

  console.log("Collectibles deployed to:", collectibles.address);

  const config = `export const FUJI_STORY_LIBRARY_CONTRACT_ADDRESS = "${storyLibrary.address}";
export const FUJI_COLLECTIBLES_CONTRACT_ADDRESS = "${collectibles.address}"
  `;

  writeFileSync(
    join(__dirname, "../client/fuji_contract_addresses.ts"),
    config
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

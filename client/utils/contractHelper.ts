import {
  STORY_LIBRARY_CONTRACT_ADDRESS,
  COLLECTIBLES_CONTRACT_ADDRESS,
} from "../local_contract_addresses";
import {
  FUJI_STORY_LIBRARY_CONTRACT_ADDRESS,
  FUJI_COLLECTIBLES_CONTRACT_ADDRESS,
} from "../fuji_contract_addresses";
import localStoryLibraryContract from "../../artifacts/contracts/StoryLibrary.sol/StoryLibrary.json";
import localCollectiblesContract from "../../artifacts/contracts/Collectibles.sol/Collectibles.json";
import apiDecryptStory from "../contracts/apiDecryptStory.json";

export const createContractConfig = (chainId: string) => {
  // default hardhat
  const contractConf = {
    storyLibraryContractAddress: STORY_LIBRARY_CONTRACT_ADDRESS,
    storyLibraryAbi: localStoryLibraryContract.abi,
    collectiblesContractAddress: COLLECTIBLES_CONTRACT_ADDRESS,
    collectibleAbi: localCollectiblesContract.abi,
    apiDecryptStoryContractAddress:
      "0x0DF1b2f9C7A02D3aa7aDC65ea3f58e17246AA3Bb",
    aipDecryptStoryAbi: apiDecryptStory.output.abi,
  };
  if (chainId === "0xa869") {
    console.log("switching addresses");
    contractConf.storyLibraryContractAddress =
      FUJI_STORY_LIBRARY_CONTRACT_ADDRESS;
    contractConf.collectiblesContractAddress =
      FUJI_COLLECTIBLES_CONTRACT_ADDRESS;
  }
  // todo check chainId for avax to switch out
  return contractConf;
};

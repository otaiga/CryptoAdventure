import axios from "axios";
import Moralis from "moralis";
import { createContractConfig } from "../../utils/contractHelper";
import {
  showErrorNotification,
  showNotification,
  showSuccessNotification,
} from "../../utils/notification";

const CollectableUpload = (opts: {
  sectionIndex: number;
  updateSection: (sectionIndex: number, updated: any) => void;
  Moralis: Moralis;
  chainId: string;
  setIsLoading: any;
}) => {
  const { sectionIndex, updateSection, Moralis, chainId, setIsLoading } = opts;

  const mintCollectable = async (cid: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const contractConf = createContractConfig(chainId);
        const tx = await Moralis.Web3.executeFunction({
          //@ts-ignore
          awaitReceipt: false,
          contractAddress: contractConf.collectiblesContractAddress,
          functionName: "mintToken",
          abi: contractConf.collectibleAbi,
          params: {
            cid,
            amount: 5,
          },
        });
        tx.on("receipt", (receipt: any) => {
          console.log("transactionHash: ", receipt.transactionHash);
          console.log("New Receipt: ", receipt);
          return resolve(receipt.events.TransferSingle.returnValues.id);
        }).on("error", (error: any) => {
          console.log(error);
          return reject(error);
        });
      } catch (err) {
        console.log(err);
        return reject(err);
      }
    });
  };

  const updateImagePath = async (fileData: File) => {
    setIsLoading(true);
    try {
      const res = await axios.post("/api/storeImage", fileData);
      if (!res.data.imageId) {
        throw Error("No imageId returned");
      }
      const fileLocation = res.data.imageId;
      const token = await mintCollectable(fileLocation);
      const collectable = token;
      setIsLoading(false);
      updateSection(sectionIndex, { collectable });
      showSuccessNotification({
        message: "Collectible update",
        description: "Collectible updated successfully",
      });
    } catch (err: any) {
      setIsLoading(false);
      console.log(err);
      if (err.code === 4001) {
        showNotification({
          message: "Cancelled",
          description: "Minting was cancelled",
        });
      } else {
        showErrorNotification({
          message: "Error",
          description: "There was an issue minting",
        });
      }
    }
  };

  return (
    <div className="flex py-4">
      <div className="mb-3 w-96">
        <label className="inline-block mb-2 font-medium text-gray-900 form-label">
          Section Collectable (NFT)
        </label>
        <input
          className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          type="file"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const collectable = e.target.files[0];
              updateImagePath(collectable);
            }
          }}
        />
      </div>
    </div>
  );
};

export default CollectableUpload;

import type { NextPage } from "next";
import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useMoralis } from "react-moralis";
import { XIcon } from "@heroicons/react/outline";
import axios from "axios";
import TopNav from "../components/TopNav";
import LoadingScreen from "../components/Loading";
import { StoryChapter, StoryChapterWithCid } from "../pages/story/story";
import { createContractConfig } from "../utils/contractHelper";
import { ethers } from "ethers";
import { showNotification, showErrorNotification } from "../utils/notification";
import { Spinner } from "../components/Spinner";

declare global {
  interface Window {
    ethereum: any;
  }
}

const Library: NextPage = () => {
  const [stories, setStories] = useState<StoryChapterWithCid[]>([]);
  const [ownedStories, setOwnedStories] = useState<Map<
    string,
    StoryChapterWithCid[]
  > | null>();
  const [allChapters, setAllChapters] = useState<StoryChapterWithCid[]>([]);
  const [storyChapters, setStoryChapters] = useState<StoryChapterWithCid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryChapter | null>(null);
  const [userId, setUserId] = useState("");
  const [collectibles, setCollectibles] = useState<string[]>([]);
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  const {
    isAuthenticated,
    Moralis,
    isWeb3Enabled,
    chainId,
    account,
    authenticate,
  } = useMoralis();

  useEffect(() => {
    if (isAuthenticated && isWeb3Enabled) {
      Moralis.User.currentAsync().then((user) => {
        if (user) {
          setUserId(user.id);
          init(user.id);
        }
      });
    }
  }, [isAuthenticated, isWeb3Enabled, account]);

  const init = async (userId: string) => {
    setIsLoading(true);
    try {
      const chapterResponse = await axios.get(`/api/chapters`);
      const chaptersData = chapterResponse.data;
      const ownedChapterResponse = await axios.get(
        `/api/ownedChapters/${userId}`
      );
      const ownedChaptersData = ownedChapterResponse.data;
      const ownedStoryMap = new Map<string, StoryChapterWithCid[]>();
      for (const chapterData of ownedChaptersData) {
        const existing = ownedStoryMap.get(`${chapterData.storyId}`);
        if (existing) {
          ownedStoryMap.set(`${chapterData.storyId}`, [
            ...existing,
            chapterData,
          ]);
        } else {
          ownedStoryMap.set(`${chapterData.storyId}`, [chapterData]);
        }
      }
      await getOwnedCollectibles();
      setAllChapters(chaptersData);
      setOwnedStories(ownedStoryMap);
      const storyMap = new Map<string, StoryChapterWithCid>();
      for (const chapterData of ownedChaptersData) {
        storyMap.set(`${chapterData.storyId}`, chapterData);
      }
      setStories(Array.from(storyMap.values()));
    } catch (err) {
      console.log(err);
      showErrorNotification({
        message: "Error",
        description: "There was an issue loading assets",
      });
    }
    setIsLoading(false);
  };

  const showStoryDetails = (story: StoryChapterWithCid) => {
    const filteredByStory = allChapters.filter(
      (storyItem) => storyItem.storyId === story.storyId
    );
    setStoryChapters(filteredByStory);
    setSelectedStory(story);
    setIsModalVisible(true);
  };

  const checkOwnedChapter = (storyId: string, chaptercid: string) => {
    const chaptersOwnedByStory = ownedStories?.get(storyId);
    if (!chaptersOwnedByStory) {
      return false;
    }
    const result = chaptersOwnedByStory.find(
      (chapterData) => chapterData.ipfsId === chaptercid
    );
    return result;
  };

  const updateOwnedChapter = (value: StoryChapterWithCid) => {
    if (value.storyId) {
      const ownedStory = ownedStories?.get(value.storyId);
      const updated = ownedStory ? [...ownedStory, value] : [value];
      ownedStories?.set(value.storyId, updated);
      setOwnedStories(ownedStories);
    }
  };

  const getOwnedCollectibles = async () => {
    const { ethereum } = window;
    if (typeof chainId !== "string") {
      setIsLoading(false);
      throw Error("No chainId found");
    }
    const contractConf = createContractConfig(chainId);
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const collectiblesContract = new ethers.Contract(
      contractConf.collectiblesContractAddress,
      contractConf.collectibleAbi,
      signer
    );

    const tokens = await collectiblesContract.getOwnedTokens();
    if (tokens && tokens.length > 0) {
      const collectiblesReturned = [];
      for (const token of tokens) {
        const tokenReturned = await collectiblesContract.getCidForToken(token);
        collectiblesReturned.push(tokenReturned);
      }
      setCollectibles(collectiblesReturned);
    }
  };

  const purchaseStoryContract = async (
    value: StoryChapterWithCid,
    index: number
  ) => {
    setIsPurchasing(index);
    if (typeof chainId !== "string") {
      setIsPurchasing(null);
      throw Error("No chainId found");
    }
    const contractConf = createContractConfig(chainId);
    const callPurchaseContract = () =>
      new Promise(async (resolve, reject) => {
        const tx = await Moralis.Web3.executeFunction({
          //@ts-ignore
          awaitReceipt: false,
          contractAddress: contractConf.storyLibraryContractAddress,
          functionName: "purchaseChapter",
          abi: contractConf.storyLibraryAbi,
          params: {
            cid: value.ipfsId,
          },
          msgValue: "10000000000000000", // 1 gwei
        });
        tx.on("receipt", (receipt: any) => {
          console.log("transactionHash: ", receipt.transactionHash);
          console.log("New Receipt: ", receipt);
          resolve(receipt.transactionHash);
        }).on("error", (error: any) => {
          console.log(error);
          reject(error);
        });
      });

    const callDecryptionContract = async () =>
      new Promise(async (resolve, reject) => {
        try {
          const tx = await Moralis.Web3.executeFunction({
            //@ts-ignore
            awaitReceipt: false,
            contractAddress: contractConf.apiDecryptStoryContractAddress,
            functionName: "requestDecrypt",
            abi: contractConf.aipDecryptStoryAbi,
            params: {
              cid: value.ipfsId,
            },
          });
          tx.on("receipt", (receipt: any) => {
            console.log("transactionHash: ", receipt.transactionHash);
            console.log("New Receipt: ", receipt);
            resolve(receipt.transactionHash);
          }).on("error", (error: any) => {
            console.log(error);
            reject(error);
          });
        } catch (err) {
          return reject(err);
        }
      });

    try {
      await callPurchaseContract();
      await callDecryptionContract();
      const res = await axios.post(`/api/ownedChapters/${userId}`, {
        storyChapter: value,
      });
      if (!res.data.cid) {
        throw Error("No cid returned");
      }
      updateOwnedChapter(value);
      setIsPurchasing(null);
      showNotification({
        message: "Success",
        description: "You have purchased a chapter!",
      });
    } catch (err: any) {
      console.log(err);
      if (err.code === 4001) {
        showNotification({
          message: "Cancelled",
          description: "Purchase was cancelled",
        });
      } else {
        showErrorNotification({
          message: "Error",
          description: "There was an issue purchasing the chapter",
        });
      }
      setIsPurchasing(null);
    }
  };

  return (
    <div>
      <div className="mx-auto bg-gradient-to-b from-cyan-500 to-blue-500">
        <div className="flex flex-col min-h-screen">
          <TopNav />
          <main>
            {!isAuthenticated ? (
              <div className="flex justify-center">
                <button
                  className="max-w-md p-2 mt-10 text-lg text-white bg-blue-500 rounded-lg hover:bg-blue-400"
                  onClick={() =>
                    authenticate({
                      signingMessage: "Authenticate for Crypto Adventure!",
                    })
                  }
                >
                  Authenticate to view
                </button>
              </div>
            ) : (
              <>
                <section className="py-2">
                  <h2 className="px-4 text-lg font-medium leading-relaxed sm:text-xl">
                    Your library
                  </h2>

                  {stories.length === 0 ? (
                    <div className="p-4 font-light ">{`It's a lonely place without any stories.`}</div>
                  ) : (
                    <ul
                      role="list"
                      className="grid grid-cols-1 gap-6 px-4 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    >
                      {stories.map((chapterInfo, index) => (
                        <li
                          tabIndex={0}
                          role="button"
                          onClick={() => {
                            showStoryDetails(chapterInfo);
                          }}
                          key={index}
                          className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                        >
                          <div className="flex flex-col flex-1">
                            <img
                              className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                              src={
                                chapterInfo?.storyImage?.includes("https")
                                  ? chapterInfo.storyImage
                                  : `https://${chapterInfo.storyImage}.ipfs.dweb.link`
                              }
                              alt=""
                            />
                            <div className="px-2 py-4">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {chapterInfo.storyTitle}
                              </h3>
                              <div className="py-4 text-xs font-light text-gray-500">
                                By Joe Bloggs
                              </div>
                              <div className="pt-2 text-sm line-clamp-3">
                                {chapterInfo.storyDescription}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
                {collectibles && collectibles.length > 0 && (
                  <section className="py-2 mt-2">
                    <div className="flex items-center justify-between px-4">
                      <h2 className="text-lg font-medium leading-relaxed sm:text-xl">
                        Your Collectibles
                      </h2>
                      <div className="text-sm text-blue-700">View all</div>
                    </div>
                    <ul
                      role="list"
                      className="grid grid-cols-1 gap-6 px-4 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    >
                      {collectibles.length > 0 &&
                        collectibles.map((collectible, i) => (
                          <li
                            key={i}
                            tabIndex={0}
                            role="button"
                            className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                          >
                            <div className="flex flex-col flex-1">
                              <img
                                className="flex-shrink-0 w-full mx-auto rounded-lg h-36"
                                src={
                                  collectible?.includes("https")
                                    ? collectible
                                    : `https://${collectible}.ipfs.dweb.link`
                                }
                                alt=""
                              />
                            </div>
                          </li>
                        ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      {isLoading && <LoadingScreen isLoading={isLoading} />}
      {isModalVisible && selectedStory && (
        <Transition.Root show={isModalVisible} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={setIsModalVisible}
          >
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block w-full pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                    <button
                      type="button"
                      className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-100"
                      onClick={() => setIsModalVisible(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>
                  <img
                    className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                    src={
                      selectedStory?.storyImage?.includes("https")
                        ? selectedStory.storyImage
                        : `https://${selectedStory.storyImage}.ipfs.dweb.link`
                    }
                    alt=""
                  />
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {selectedStory.storyTitle}
                    </h3>
                    <div className="pt-2 text-sm font-light">
                      {selectedStory.storyDescription}
                    </div>
                    <p className="mt-4 text-lg font-medium text-gray-900">
                      Chapters
                    </p>
                    <div className="text-gray-700">
                      <ul className="flex flex-col">
                        {storyChapters.map((value, index) => (
                          <li key={index}>
                            {/* check if owner has this chapter if not then purchase */}
                            {value.storyId &&
                            value.ipfsId &&
                            checkOwnedChapter(value.storyId, value.ipfsId) ? (
                              <div className="hover:bg-gray-100 mb-2">
                                <a key={index} href={`/story/${value.ipfsId}`}>
                                  <div className="font-medium text-gray-900 hover:text-blue-500">
                                    {`${index + 1}. ${value.chapterTitle}`}
                                  </div>
                                </a>
                              </div>
                            ) : (
                              <div className="text-left w-full flex justify-between text-gray-900 mb-2 items-center hover:bg-gray-100">
                                <p>{`${index + 1}. ${value.chapterTitle}`}</p>
                                <div>
                                  {isPurchasing === index ? (
                                    <Spinner className="ml-2"></Spinner>
                                  ) : (
                                    <button
                                      key={index}
                                      onClick={async () => {
                                        if (value.ipfsId && value.storyId) {
                                          await purchaseStoryContract(
                                            value,
                                            index
                                          );
                                        }
                                      }}
                                    >
                                      <span className="h-7 flex items-center">
                                        <div className="flex items-center px-2 py-1 ml-2 space-x-1 text-white bg-indigo-500 rounded-lg border-1">
                                          <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                            />
                                          </svg>
                                          <p className="text-sm">{`0.01 ETH`}</p>
                                        </div>
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      )}
    </div>
  );
};

export default Library;

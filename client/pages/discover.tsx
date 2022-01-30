import type { NextPage } from "next";
import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useMoralis } from "react-moralis";
import { XIcon } from "@heroicons/react/outline";
import axios from "axios";
import TopNav from "../components/TopNav";
import { Spinner } from "../components/Spinner";
import LoadingScreen from "../components/Loading";
import { StoryChapterWithCid } from "../pages/story/story";
import { createContractConfig } from "../utils/contractHelper";
import {
  showErrorNotification,
  showNotification,
  showSuccessNotification,
} from "../utils/notification";
import Ratings from "../components/Ratings";
import Share from "../components/Share";

const Library: NextPage = () => {
  const [allStories, setAllStories] = useState<StoryChapterWithCid[]>([]);
  const [stories, setStories] = useState<StoryChapterWithCid[]>([]);
  const [ownedStories, setOwnedStories] = useState<Map<
    string,
    StoryChapterWithCid[]
  > | null>();
  const [storyChapters, setStoryChapters] = useState<StoryChapterWithCid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] =
    useState<StoryChapterWithCid | null>(null);
  const [userId, setUserId] = useState("");
  const { isAuthenticated, Moralis, isWeb3Enabled, chainId, account } =
    useMoralis();

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
      setAllStories(chaptersData);
      setOwnedStories(ownedStoryMap);
      const storyMap = new Map<string, StoryChapterWithCid>();
      for (const chapterData of chaptersData) {
        storyMap.set(`${chapterData.storyId}`, chapterData);
      }
      setStories(Array.from(storyMap.values()));
    } catch (err) {
      showErrorNotification({
        message: "Error",
        description: "There was an issue loading assets",
      });
      console.log(err);
    }
    setIsLoading(false);
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
        setIsPurchasing(null);
        throw Error("No cid returned");
      }
      updateOwnedChapter(value);
      setIsPurchasing(null);
      showSuccessNotification({
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

  const showStoryDetails = (story: StoryChapterWithCid) => {
    const filteredByStory = allStories.filter(
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

  const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  };

  return (
    <div className="bg-gradient-to-b from-[#ff5858] to-[#ffc8c8]">
      <div className="mx-auto">
        <div className="flex flex-col min-h-screen">
          <TopNav />
          <main>
            <section className="">
              <div className="bg-gray-900">
                <div className="px-4 py-6 max-w-7xl sm:px-6 ">
                  <div className="">
                    <h2 className="text-3xl font-medium tracking-tight text-white">
                      Search for your next adventure
                    </h2>
                  </div>
                  <div className="mt-4 ">
                    <form className="sm:flex">
                      <input
                        className="w-full px-5 py-3 placeholder-gray-500 border border-transparent rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white focus:border-white sm:max-w-xs"
                        placeholder="Adventures in crypto"
                      />
                      <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                          className="flex items-center justify-center w-full px-5 py-3 text-base font-medium text-white bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                        >
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
                              d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
                            />
                          </svg>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section>
            <section>
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
                        <div className="pt-2 text-sm line-clamp-3">
                          {chapterInfo.storyDescription}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Ratings score={getRandomInt(3, 5)} />
                        <Share />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <section className="py-2 mt-2">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium leading-relaxed sm:text-xl">
                  Editor's Picks
                </h2>
                <div className="text-sm text-blue-700">View all</div>
              </div>
              <ul
                role="list"
                className="grid grid-cols-1 gap-6 px-4 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              >
                <li
                  tabIndex={0}
                  role="button"
                  className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                >
                  <div className="flex flex-col flex-1">
                    <img
                      className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                      src="https://bafybeib5hhiy7zm4vax25vapum2ookftouu7hukhbscvhz7lmiykufmhby.ipfs.dweb.link/cesar-couto-VlThqxlFaE0-unsplash.jpeg"
                      alt=""
                    />
                    <div className="px-2 py-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        Pointy Break
                      </h3>
                      <div className="text-xs font-light text-gray-500">
                        By Bruce Miller
                      </div>
                      <div className="pt-2 text-sm line-clamp-3">
                        And Jack Benny is secretary of the Treasury. I got
                        enough practical jokes for one evening. Good night,
                        future boy. Ho, you mean you're gonna touch her on her-
                        The flux capacitor. But you're good, Marty, you're
                        really good. And this audition tape of your is great,
                        you gotta send it in to the record company. It's like
                        Doc's always saying.
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Ratings score={getRandomInt(2, 5)} />
                      <Share />
                    </div>
                  </div>
                </li>
                <li
                  tabIndex={0}
                  role="button"
                  className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                >
                  <div className="flex flex-col flex-1">
                    <img
                      className="flex-shrink-0 object-cover w-full rounded-t-lg h-36"
                      src="https://bafybeicyzmkvmk3a5rfawpmhqtp2ixkuf7dhabw2327jjqwt2rjvrjazdm.ipfs.dweb.link/spencer-davis-yVekjvme2oU-unsplash.jpeg"
                      alt=""
                    />
                    <div className="px-2 py-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate ">
                        Throttle Fever
                      </h3>
                      <div className="text-xs font-light text-gray-500">
                        By Jane Swimmer
                      </div>
                      <div className="pt-2 text-sm line-clamp-3">
                        Science Fiction Theater. Great Scott. Let me see that
                        photograph again of your brother. Just as I thought,
                        this proves my theory, look at your brother. See,
                        there's Biff out there waxing it right now. Now, Biff, I
                        wanna make sure that we get two coats of wax this time,
                        not just one. That ain't no airplane, look. Perfect,
                        just perfect.
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Ratings score={getRandomInt(2, 5)} />
                      <Share />
                    </div>
                  </div>
                </li>
                <li
                  tabIndex={0}
                  role="button"
                  className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                >
                  <div className="flex flex-col flex-1">
                    <img
                      className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                      src="https://bafybeiguirtojzh4lzgw3lhromvtjt5x6nlct4y6i265oqzzsbuecqlekm.ipfs.dweb.link/arthur-rachbauer-vYyHLDPKWd4-unsplash.jpeg"
                      alt=""
                    />
                    <div className="px-2 py-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate ">
                        The Purple Rose
                      </h3>
                      <div className="text-xs font-light text-gray-500">
                        By Catherine Petal
                      </div>
                      <div className="pt-2 text-sm line-clamp-3">
                        Why thank you, Marty. George. Good morning, sleepyhead,
                        Good morning, Dave, Lynda I'm gonna get that
                        son-of-a-bitch. Right. Go. Go. He's fine, and he's
                        completely unaware that anything happened. As far as
                        he's concerned the trip was instantaneous.
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Ratings score={getRandomInt(2, 5)} />
                      <Share />
                    </div>
                  </div>
                </li>
                <li
                  tabIndex={0}
                  role="button"
                  className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                >
                  <div className="flex flex-col flex-1">
                    <img
                      className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                      src="https://bafybeiceiew4evalj4hjpqqsmue5jcr762hgq7bf6aq525fhh3zz3iel6e.ipfs.dweb.link/hussain-faruhaan-5Kbc5Yl77MI-unsplash.jpeg"
                      alt=""
                    />
                    <div className="px-2 py-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate ">
                        Shallow Surf
                      </h3>
                      <div className="text-xs font-light text-gray-500">
                        By Ken Bruce
                      </div>
                      <div className="pt-2 text-sm line-clamp-3">
                        Marty. Marty. Marty. I'm gonna ram him. Hey, hey, keep
                        rolling, keep rolling there. No, no, no, no, this
                        sucker's electrical. But I need a nuclear reaction to
                        generate the one point twenty-one gigawatts of
                        electricity that I need. Yeah. Which one's your pop?
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Ratings score={getRandomInt(2, 5)} />
                      <Share />
                    </div>
                  </div>
                </li>
                <li
                  tabIndex={0}
                  role="button"
                  className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                >
                  <div className="flex flex-col flex-1">
                    <img
                      className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                      src="https://bafybeigg3prd6tb6lpkkpx4ssk3xgsqjovnwjoy2okv6v45atzd2hi3ina.ipfs.dweb.link/brad-pouncey-UM8JJE_WpDQ-unsplash.jpeg"
                      alt=""
                    />
                    <div className="px-2 py-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate ">
                        Yellow Charger
                      </h3>
                      <div className="text-xs font-light text-gray-500">
                        By Chuck Saint
                      </div>
                      <div className="pt-2 text-sm line-clamp-3">
                        Ahh. That was so stupid, Grandpa hit him with the car.
                        He's an absolute dream. That's right. The appropriate
                        question is, weren't the hell are they. Einstein has
                        just become the world's first time traveler. I sent him
                        into the future.
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Ratings score={getRandomInt(2, 5)} />
                      <Share />
                    </div>
                  </div>
                </li>
              </ul>
            </section>
            <section className="py-2 mt-4">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium leading-relaxed sm:text-xl">
                  Your Wish List
                </h2>
                <div className="text-sm text-blue-700">View all</div>
              </div>
              <ul
                role="list"
                className="grid grid-cols-1 gap-6 px-4 mt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              >
                <li
                  tabIndex={0}
                  role="button"
                  className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                >
                  <div className="flex flex-col flex-1">
                    <img
                      className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                      src="https://bafybeigg3prd6tb6lpkkpx4ssk3xgsqjovnwjoy2okv6v45atzd2hi3ina.ipfs.dweb.link/brad-pouncey-UM8JJE_WpDQ-unsplash.jpeg"
                      alt=""
                    />
                    <div className="px-2 py-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate ">
                        Yellow Charger
                      </h3>
                      <div className="text-xs font-light text-gray-500">
                        By Chuck Saint
                      </div>
                      <div className="pt-2 text-sm line-clamp-3">
                        How's your head? Biff. Give me a hand, Lorenzo. Ow,
                        dammit, man, I sliced my hand. Hello. Um, yeah well I
                        might have sort of ran into my parents.
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Ratings score={getRandomInt(2, 5)} />
                      <Share />
                    </div>
                  </div>
                </li>
                <li
                  tabIndex={0}
                  role="button"
                  className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                >
                  <div className="flex flex-col flex-1">
                    <img
                      className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                      src="https://bafybeiehptrrklflvbpgbb6cfs5ucgftyz2nvzc62rro6a4le5cwfusg4a.ipfs.dweb.link/hrvoje_photography-pdRsf77OBoo-unsplash.jpeg"
                      alt=""
                    />
                    <div className="px-2 py-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate ">
                        Island Life
                      </h3>
                      <div className="text-xs font-light text-gray-500">
                        By Scott Blank
                      </div>
                      <div className="pt-2 text-sm line-clamp-3">
                        Are you okay? Hey, George, buddy, you weren't at school,
                        what have you been doing all day? No, not yet. Watch it,
                        Goldie. Yeah.
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Ratings score={getRandomInt(2, 5)} />
                      <Share />
                    </div>
                  </div>
                </li>
                <li
                  tabIndex={0}
                  role="button"
                  className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                >
                  <div className="flex flex-col flex-1">
                    <img
                      className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                      src="https://bafybeiaep2q6qhk67sdfz5erkmdmux3g447yzy6doaiwd6glqmajq5hc44.ipfs.dweb.link/cj-dayrit-LSKsYHGj4rI-unsplash.jpeg"
                      alt=""
                    />
                    <div className="px-2 py-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate ">
                        High Spire
                      </h3>
                      <div className="text-xs font-light text-gray-500">
                        By Sarah Twine
                      </div>
                      <div className="pt-2 text-sm line-clamp-3">
                        Save the clock tower. It's a board with wheels. Let's
                        get you into a radiation suit, we must prepare to
                        reload. Oh, oh a rematch, why, were you cheating? Oh,
                        just a little weather experiment.
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Ratings score={getRandomInt(2, 5)} />
                      <Share />
                    </div>
                  </div>
                </li>
                <li
                  tabIndex={0}
                  role="button"
                  className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                >
                  <div className="flex flex-col flex-1">
                    <img
                      className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                      src="https://bafybeigbx6dfcxda6odezkagiden3kmffgiv5wetv224phnctw76kexu7u.ipfs.dweb.link/eric-masur-vVLTtOG12sA-unsplash.jpeg"
                      alt=""
                    />
                    <div className="px-2 py-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate ">
                        Take-off
                      </h3>
                      <div className="text-xs font-light text-gray-500">
                        By Captain Walters
                      </div>
                      <div className="pt-2 text-sm line-clamp-3">
                        Where does he come from? Hey, hey, keep rolling, keep
                        rolling there. No, no, no, no, this sucker's electrical.
                        But I need a nuclear reaction to generate the one point
                        twenty-one gigawatts of electricity that I need.
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Ratings score={getRandomInt(2, 5)} />
                      <Share />
                    </div>
                  </div>
                </li>
                <li
                  tabIndex={0}
                  role="button"
                  className="flex flex-col col-span-1 bg-white border divide-y divide-gray-200 rounded-lg shadow-lg hover:!shadow hover:bg-gray-100"
                >
                  <div className="flex flex-col flex-1">
                    <img
                      className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                      src="https://bafybeife7syeevweib2g7bfmmpzvj7ktk5qwq372liinyomycpnbzx6ryi.ipfs.dweb.link/benjamin-deyoung-lTZffd_tOnM-unsplash.jpeg"
                      alt=""
                    />
                    <div className="px-2 py-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate ">
                        Burning Beach
                      </h3>
                      <div className="text-xs font-light text-gray-500">
                        By Grace Walker
                      </div>
                      <div className="pt-2 text-sm line-clamp-3">
                        Your, your right. Yeah, I think maybe you do. My
                        equipment, that reminds me, Marty, you better not hook
                        up to the amplifier. There's a slight possibility for
                        overload. Wrecked? No.
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Ratings score={getRandomInt(2, 5)} />
                      <Share />
                    </div>
                  </div>
                </li>
              </ul>
            </section>
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
                            {value.storyId &&
                            value.ipfsId &&
                            checkOwnedChapter(value.storyId, value.ipfsId) ? (
                              <div className="mb-2 hover:bg-gray-100">
                                <a key={index} href={`/story/${value.ipfsId}`}>
                                  <div className="font-medium text-gray-900 hover:text-blue-500">
                                    {`${index + 1}. ${value.chapterTitle}`}
                                  </div>
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between w-full mb-2 text-left text-gray-900 hover:bg-gray-100">
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
                                      <span className="flex items-center h-7">
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

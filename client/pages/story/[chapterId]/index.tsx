import { useRouter } from "next/router";
import { useState, useEffect, useRef, Fragment } from "react";
import type { NextPage } from "next";
import { Howl } from "howler";
import { ethers } from "ethers";
import TopNav from "../../../components/TopNav";
import { Story, StoryData, Options } from "../story";
import { Dialog, Transition } from "@headlessui/react";
import { useMoralis } from "react-moralis";
import { createContractConfig } from "../../../utils/contractHelper";
import LoadingScreen from "../../../components/Loading";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../utils/notification";

const Story: NextPage = () => {
  const { isAuthenticated, Moralis, isWeb3Enabled, chainId, account } =
    useMoralis();

  const [page, setPage] = useState<string | null>(null);
  const [pageData, setPageData] = useState<StoryData | null>(null);
  const [chapterInfo, setChapterInfo] =
    useState<{ [key: string]: StoryData }>();
  const [showText, setShowText] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [dismissedCollectable, setDismissedCollectable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [collectiblePopUp, setCollectiblePopUp] = useState<{
    show: boolean;
    collectibleImage: string | null;
    tokenBalance: number | null;
    supplyBalance: number | null;
  }>({
    show: false,
    collectibleImage: null,
    tokenBalance: null,
    supplyBalance: null,
  });
  const [userId, setUserId] = useState("");

  const router = useRouter();
  const { chapterId } = router.query;

  const audioFile = useRef<Howl[]>([]);
  const audioIndex = useRef<number>(0);
  const storyVars = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (isAuthenticated && isWeb3Enabled) {
      if (!chapterId || typeof chapterId !== "string") {
        console.log("no chapter id provided");
        return;
      }
      Moralis.User.currentAsync().then((user) => {
        if (user) {
          setUserId(user.id);
          init(chapterId);
        }
      });
    }
  }, [isAuthenticated, isWeb3Enabled, chapterId, account]);

  useEffect(() => {
    stopAllAudio();
    if (!chapterInfo) {
      console.log("no chapter found");
      return;
    }
    audioIndex.current = 0;
    const data = chapterInfo[`${page ? page : Object.keys(chapterInfo)[0]}`];
    setPageData(data);
    if (
      data &&
      data.collectable &&
      typeof data.collectable === "string" &&
      !dismissedCollectable &&
      !collectiblePopUp.show
    ) {
      obtainCollectible(data);
    } else {
      loadAudio(data);
    }
  }, [page, chapterInfo]);

  const loadAudio = (data: any) => {
    if (data && data.audio) {
      audioFile.current = [];
      for (const audioPath of data.audio) {
        const src = evaluateAction(audioPath);
        console.log({ src });
        if (src) {
          const howl = new Howl({
            src: [
              src.includes("https") ? src : `https://${src}.ipfs.dweb.link`,
            ],
            format: ["mp3"],
            onend: onAudioEnd,
          });
          audioFile.current = [...audioFile.current, howl];
        }
      }
      if (
        audioFile &&
        audioFile.current[0] &&
        !audioFile.current[0].playing()
      ) {
        audioFile.current[0].play();
      }
    } else {
      setShowText(true);
      setShowOptions(true);
    }
  };

  const obtainChapterData = async (chapterId: string) => {
    try {
      const query = new Moralis.Query("Chapter");
      query.equalTo("sender", account);
      query.equalTo("ipfsId", chapterId);
      const retrieved = await query.find();
      if (!retrieved || retrieved.length == 0) {
        return {};
      }
      const value = retrieved[0];
      return JSON.parse(value.get("storyText"));
    } catch (err) {
      console.log(err);
      return {};
    }
  };

  const init = async (chapterId: string) => {
    const chapterData = await obtainChapterData(chapterId);
    setChapterInfo(chapterData);
  };

  // Manage sequence of audio files
  const onAudioEnd = () => {
    audioIndex.current += 1;
    if (audioFile.current.length === 0) {
      setShowOptions(true);
      return;
    }
    if (
      audioFile.current[audioIndex.current] &&
      !audioFile.current[audioIndex.current].playing()
    ) {
      audioFile.current[audioIndex.current].play();
    } else {
      setShowOptions(true);
    }
  };

  const stopAllAudio = () => {
    for (const audio of audioFile.current) {
      audio.stop();
    }
  };

  const captialise = (value: string) =>
    `${value.slice(0, 1).toUpperCase() + value.slice(1, value.length)}`;

  const Choices = () => {
    const positions = [
      { top: "50%", right: "3%" },
      { top: "50%", left: "1%" },
      { top: "2%", right: "50%" },
      { bottom: "2%", right: "50%" },
    ];
    const directions = [
      "M9 5l7 7-7 7",
      "M15 19l-7-7 7-7",
      "M5 15l7-7 7 7",
      "M19 9l-7 7-7-7",
    ];
    const renderArrow = (index: number) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={directions[index]}
        />
      </svg>
    );

    const pageOptions = () => {
      if (pageData && pageData.options) {
        const options: Options = pageData.options;
        return Object.keys(options).map((key, index) => {
          if (index > 3) {
            return;
          }
          return (
            <button
              className="flex items-center font-bold absolute ml-8 hover:text-gray-300 bg-black bg-opacity-50 p-2"
              style={positions[index]}
              key={index}
              onClick={() => {
                if (options[key]) {
                  setShowOptions(false);
                  stopAllAudio();
                  setPage(options[key]);
                }
              }}
            >
              {index === 0 ? (
                <>
                  {captialise(key)}
                  {renderArrow(index)}
                </>
              ) : index === 1 ? (
                <>
                  {renderArrow(index)}
                  {captialise(key)}
                </>
              ) : index === 2 ? (
                <div className="flex flex-col items-center">
                  {renderArrow(index)}
                  {captialise(key)}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {captialise(key)}
                  {renderArrow(index)}
                </div>
              )}
            </button>
          );
        });
      }
    };
    const skipAudioButton = () => {
      return (
        <button
          className="flex items-center font-bold absolute ml-8 hover:text-gray-300 bg-black bg-opacity-50 p-2"
          style={positions[0]}
          key={0}
          onClick={() => {
            stopAllAudio();
            setShowOptions(true);
          }}
        >
          Skip Audio
        </button>
      );
    };
    return (
      <div className="text-2xl mb-auto relative h-full">
        {showOptions ? pageOptions() : skipAudioButton()}
      </div>
    );
  };

  const evaluateAction = (item: any) => {
    if (typeof item === "string") {
      return item;
    }
    if (typeof item.audio === "string") {
      return item.audio;
    }
    if (typeof item === "object") {
      if (item.var && item.true && item.rule && item.false) {
        if (item.rule === "equals") {
          if (storyVars.current[item.var] === "true") {
            return item["true"];
          } else {
            return item["false"];
          }
        }
      }
    }
  };

  const Transcript = () => (
    <div className="flex flex-col justify-start items-start py-3 px-10 w-full bg-black opacity-70">
      <button
        onClick={() => {
          setShowText(!showText);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 hover:stroke-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      </button>
      {showText &&
        pageData &&
        pageData.p?.map((item, index) => (
          <p key={index} className="pt-2 text-xl font-bold">
            {evaluateAction(item)}
          </p>
        ))}
    </div>
  );

  if (pageData && pageData.actions) {
    storyVars.current = { ...storyVars, ...pageData.actions };
  }

  const backgroundImage = () => {
    if (pageData && pageData.image) {
      const link = pageData.image.includes("https")
        ? `url(${pageData.image})`
        : `url(https://${pageData.image}.ipfs.dweb.link)`;
      return {
        minHeight: "95vh",
        backgroundImage: link,
      };
    }
  };

  const getOwnedCollectibles = async (contractConf: any) => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const collectiblesContract = new ethers.Contract(
      contractConf.collectiblesContractAddress,
      contractConf.collectibleAbi,
      signer
    );

    const tokenResponse = await collectiblesContract.getOwnedTokens();
    const tokens: number[] = [];
    for (const token of tokenResponse) {
      tokens.push(Number(token));
    }
    return tokens && tokens.length > 0 ? tokens : [];
  };

  const getCollectibleBalance = async (contractConf: any, tokenId: number) => {
    const tokenBalance = await Moralis.Web3.executeFunction({
      contractAddress: contractConf.collectiblesContractAddress,
      functionName: "balanceRemaining",
      abi: contractConf.collectibleAbi,
      params: {
        tokenId,
      },
    });
    const supplyBalance = await Moralis.Web3.executeFunction({
      contractAddress: contractConf.collectiblesContractAddress,
      functionName: "tokenSupply",
      abi: contractConf.collectibleAbi,
      params: {
        tokenId,
      },
    });
    return { tokenBalance, supplyBalance };
  };

  const renderTokenRemaining = () => {
    if (collectiblePopUp.supplyBalance && collectiblePopUp.tokenBalance) {
      const itemNo =
        collectiblePopUp.supplyBalance - collectiblePopUp.tokenBalance + 1;
      return `#${itemNo} of ${collectiblePopUp.supplyBalance}`;
    }
    return "";
  };

  const obtainCollectible = async (data: any) => {
    try {
      if (typeof chainId !== "string") {
        throw Error("No chainId found");
      }
      const tokenIdInt = parseInt(data.collectable);
      const contractConf = createContractConfig(chainId);
      const ownedTokens = await getOwnedCollectibles(contractConf);
      const ownedToken = ownedTokens.indexOf(tokenIdInt) >= 0;
      const { tokenBalance, supplyBalance } = await getCollectibleBalance(
        contractConf,
        tokenIdInt
      );
      if (!tokenBalance || tokenBalance <= 0 || ownedToken) {
        return loadAudio(data);
      }
      const tx = await Moralis.Web3.executeFunction({
        contractAddress: contractConf.collectiblesContractAddress,
        functionName: "getCidForToken",
        abi: contractConf.collectibleAbi,
        params: {
          tokenId: tokenIdInt,
        },
      });

      setCollectiblePopUp({
        show: true,
        collectibleImage: tx,
        tokenBalance,
        supplyBalance,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  const collectToken = async () =>
    new Promise(async (resolve, reject) => {
      try {
        if (typeof chainId !== "string") {
          return reject("No chainId found");
        }
        if (!pageData || !pageData.collectable) {
          return reject("No collectible");
        }
        const contractConf = createContractConfig(chainId);
        const tx = await Moralis.Web3.executeFunction({
          //@ts-ignore
          awaitReceipt: false,
          contractAddress: contractConf.storyLibraryContractAddress,
          functionName: "collectToken",
          abi: contractConf.storyLibraryAbi,
          params: {
            collectibleContract: contractConf.collectiblesContractAddress,
            tokenId: parseInt(pageData.collectable),
          },
        });
        tx.on("receipt", (receipt: any) => {
          console.log("transactionHash: ", receipt.transactionHash);
          console.log("New Receipt: ", receipt);
          console.log(receipt.transactionHash);
          return resolve(receipt.transactionHash);
        }).on("error", (error: any) => {
          console.log(error);
          return reject(error);
        });
      } catch (err) {
        console.log(err);
        return reject(err);
      }
    });

  return (
    <div className="mx-auto">
      {chapterInfo ? (
        <main
          className="flex flex-col h-screen text-white bg-cover bg-center bg-no-repeat"
          style={backgroundImage()}
        >
          <TopNav />
          {!collectiblePopUp.show && <Choices />}
          <Transcript />
        </main>
      ) : (
        <main
          className="flex flex-col h-screen text-white bg-cover bg-center bg-no-repeat"
          style={backgroundImage()}
        >
          <TopNav />
          <div className="text-black">No Chapter found</div>
        </main>
      )}
      {isLoading && <LoadingScreen isLoading={isLoading} />}
      {
        <Transition.Root show={collectiblePopUp.show} as={Fragment}>
          <Dialog
            as="div"
            className="fixed z-10 inset-0 overflow-y-auto"
            onClose={() =>
              setCollectiblePopUp({
                show: false,
                collectibleImage: null,
                tokenBalance: null,
                supplyBalance: null,
              })
            }
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div>
                    <div className="aspect-w-3 aspect-h-2">
                      <img
                        className="object-cover shadow-lg rounded-lg"
                        src={
                          collectiblePopUp.collectibleImage
                            ? collectiblePopUp?.collectibleImage?.includes(
                                "https"
                              )
                              ? collectiblePopUp.collectibleImage
                              : `https://${collectiblePopUp.collectibleImage}.ipfs.dweb.link`
                            : ""
                        }
                        alt=""
                      />
                    </div>

                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-lg leading-6 font-medium text-gray-900"
                      >
                        Secret Item Found!
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          You have found a secret collectible item!
                        </p>
                        <p className="pt-2 text-sm text-gray-500 font-medium">
                          {renderTokenRemaining()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          await collectToken();
                          showSuccessNotification({
                            message: "You have a new collectible!",
                            description:
                              "Check out your collectibles in your library",
                          });
                          setDismissedCollectable(true);
                          setCollectiblePopUp({
                            show: false,
                            collectibleImage: null,
                            tokenBalance: null,
                            supplyBalance: null,
                          });
                          setIsLoading(false);
                          loadAudio(pageData);
                        } catch (err) {
                          console.log("error back from transaction");
                          showErrorNotification({
                            message: "Cancel Collectible",
                            description: "You have not collected the item.",
                          });
                          setCollectiblePopUp({
                            show: false,
                            collectibleImage: null,
                            supplyBalance: null,
                            tokenBalance: null,
                          });
                          setIsLoading(false);
                          loadAudio(pageData);
                        }
                      }}
                    >
                      Collect it
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => {
                        setDismissedCollectable(true);
                        setCollectiblePopUp({
                          show: false,
                          collectibleImage: null,
                          supplyBalance: null,
                          tokenBalance: null,
                        });
                        loadAudio(pageData);
                      }}
                    >
                      Leave it
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      }
    </div>
  );
};

export default Story;

import { FormEvent, useState, useEffect } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMoralis } from "react-moralis";
import { StoryChapter } from "../pages/story/story";
import TopNav from "../components/TopNav";
import {
  Options,
  Actions,
  AudioUpload,
  ImageUpload,
  CollectableUpload,
} from "../components/CreateStoryForm";
import Transcript from "../components/CreateStoryForm/Transcript";
import axios from "axios";
import { createContractConfig } from "../utils/contractHelper";
import { showErrorNotification, showNotification } from "../utils/notification";
import LoadingScreen from "../components/Loading";

const createStory: NextPage = () => {
  const {
    isAuthenticated,
    Moralis,
    isWeb3Enabled,
    chainId,
    account,
    authenticate,
  } = useMoralis();
  const router = useRouter();
  const { storyId } = router.query;

  useEffect(() => {
    if (isAuthenticated && isWeb3Enabled) {
      Moralis.User.currentAsync().then((user) => {
        if (user) {
          setUserId(user.id);
          init();
        }
      });
    }
  }, [isAuthenticated, isWeb3Enabled, account]);

  const [meta, setMeta] = useState<StoryChapter>({});
  const [sectionData, setSectionData] = useState<any[]>([{}]);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const init = async () => {
    if (!storyId) {
      return;
    }
    const storyDataResponse = await axios.get(`/api/storyData/${storyId}`);
    const storyData = storyDataResponse.data;
    if (storyData) {
      setMeta({ ...meta, ...storyData });
    }
  };

  const setStoryContract = async (cid: string) =>
    new Promise(async (resolve, reject) => {
      if (typeof chainId !== "string") {
        return reject(Error("No chainId found"));
      }
      const contractConf = createContractConfig(chainId);
      const tx = await Moralis.Web3.executeFunction({
        //@ts-ignore
        awaitReceipt: false,
        contractAddress: contractConf.storyLibraryContractAddress,
        functionName: "setChapter",
        abi: contractConf.storyLibraryAbi,
        params: {
          cid,
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

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const mergedSections: { [key: string]: any } = {};
    sectionData.map((section: any) => {
      if (section.sectionKey) {
        const key: string = section.sectionKey;
        mergedSections[key] = section;
      }
    });
    const toUpload = {
      metaData: meta,
      chapterData: mergedSections,
      owner: userId,
      storyId,
      account,
    };
    try {
      const res = await axios.post("/api/upload", toUpload);
      if (!res.data.cid) {
        throw Error("No cid returned");
      }
      const storyCid = res.data.cid;
      console.log("Uploaded Story", storyCid);
      await setStoryContract(storyCid);
      setIsLoading(false);
      router.push("/author");
    } catch (err) {
      console.log(err);
      showErrorNotification({
        message: "Error",
        description: "There was an issue uploading story chapter",
      });
      setIsLoading(false);
    }
  };

  const checkAllMeta = () => {
    if (
      meta.storyTitle &&
      meta.storyDescription &&
      meta.chapterTitle &&
      meta.chapterDescription
    ) {
      return true;
    }
  };

  const addSection = () => {
    const currentSectionData = [...sectionData];
    currentSectionData.push({});
    setSectionData(currentSectionData);
  };

  const removesSection = (index: number) => {
    const currentSectionData = [...sectionData];
    currentSectionData.splice(index, 1);
    setSectionData(currentSectionData);
  };

  const updateSection = (index: number, updated: any) => {
    const currentSectionData = [...sectionData];
    currentSectionData[index] = { ...currentSectionData[index], ...updated };
    delete currentSectionData[index]["0"];
    setSectionData(currentSectionData);
  };

  const updateImageMetaPath = async (fileData: File) => {
    try {
      const res = await axios.post("/api/storeImage", fileData);
      if (!res.data.imageId) {
        throw Error("No imageId returned");
      }
      const storyImage = res.data.imageId;
      const updated = { ...meta, ...{ storyImage } };
      setMeta(updated);
      showNotification({
        message: "Image update",
        description: "Image updated successfully",
      });
    } catch (err) {
      console.log(err);
      showErrorNotification({
        message: "Error",
        description: "Error storing image",
      });
    }
  };

  const sectionInfo = (sectionIndex: number, sectionD: any) => (
    <div
      key={sectionIndex}
      className="max-w-xl p-4 m-2 bg-white border rounded-lg shadow-lg"
    >
      <div className="space-y-2">
        <label className="font-medium text-gray-900">Section Title</label>
        <input
          placeholder="introduction"
          className="w-full h-10 px-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
          value={sectionD.sectionKey ? sectionD.sectionKey : ""}
          onChange={(e) => {
            const sectionKey = e.target.value;
            const updated = { ...sectionD, ...{ sectionKey } };
            updateSection(sectionIndex, updated);
          }}
        ></input>
      </div>
      <ImageUpload
        sectionIndex={sectionIndex}
        updateSection={updateSection}
        setIsLoading={setIsLoading}
      />
      <Transcript sectionIndex={sectionIndex} updateSection={updateSection} />
      <AudioUpload
        sectionIndex={sectionIndex}
        updateSection={updateSection}
        setIsLoading={setIsLoading}
      />
      <Options sectionIndex={sectionIndex} updateSection={updateSection} />
      <Actions sectionIndex={sectionIndex} updateSection={updateSection} />
      <CollectableUpload
        sectionIndex={sectionIndex}
        updateSection={updateSection}
        Moralis={Moralis}
        chainId={chainId ? chainId : ""}
        setIsLoading={setIsLoading}
      />
      {sectionData.length > 1 && sectionData.length === sectionIndex + 1 && (
        <div className="flex justify-center">
          <button
            className="p-2"
            onClick={() => {
              removesSection(sectionIndex);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="mx-auto bg-white">
        <div className="flex flex-col h-screen">
          <TopNav />
          <h1 className="my-4 text-3xl font-bold text-center text-gray-900 title-font">
            Story Creator
          </h1>
          <p className="text-lg font-medium leading-relaxed text-center sm:text-xl md:px-32">
            Create chapters for you adventure story
          </p>
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
            <main className="flex flex-col p-2 text-black">
              <form onSubmit={submitHandler}>
                <div className="flex flex-wrap justify-center p-2 ">
                  <div className="w-full max-w-xl space-y-4">
                    {storyId ? (
                      <ul>
                        <li>Title: {meta.storyTitle}</li>
                        <li>Description: {meta.storyDescription}</li>
                        <li>
                          <img
                            className="flex-shrink-0 object-cover w-full mx-auto rounded-t-lg h-36"
                            src={
                              meta?.storyImage?.includes("https")
                                ? meta.storyImage
                                : `https://${meta.storyImage}.ipfs.dweb.link`
                            }
                            alt=""
                          />
                        </li>
                      </ul>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="font-medium text-gray-900">
                            Story Title
                          </label>
                          <input
                            placeholder="My Adventure Story"
                            className="w-full h-10 px-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
                            value={meta.storyTitle ? meta.storyTitle : ""}
                            onChange={(e) => {
                              const storyTitle = e.target.value;
                              const updated = { ...meta, ...{ storyTitle } };
                              setMeta(updated);
                            }}
                          ></input>
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium text-gray-900 ">
                            Story Description
                          </label>
                          <textarea
                            placeholder="This is a description of the story"
                            rows={3}
                            className="form-control block w-full px-3 py-1.5 text-md bg-gray-100 hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100 font-normal text-gray-700 bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:outline-none"
                            value={
                              meta.storyDescription ? meta.storyDescription : ""
                            }
                            onChange={(e) => {
                              const storyDescription = e.target.value;
                              const updated = {
                                ...meta,
                                ...{ storyDescription },
                              };
                              setMeta(updated);
                            }}
                          ></textarea>
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium text-gray-900 ">
                            Story Cover Image
                          </label>
                          <input
                            className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                            type="file"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const image = e.target.files[0];
                                updateImageMetaPath(image);
                              }
                            }}
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <label className="font-medium text-gray-900 ">
                        Chapter Title
                      </label>
                      <input
                        className="w-full h-10 px-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
                        value={meta.chapterTitle ? meta.chapterTitle : ""}
                        placeholder="My Title"
                        onChange={(e) => {
                          const chapterTitle = e.target.value;
                          const updated = { ...meta, ...{ chapterTitle } };
                          setMeta(updated);
                        }}
                      ></input>
                    </div>
                    <div className="space-y-2">
                      <label className="font-medium text-gray-900 ">
                        Chapter Description
                      </label>
                      <textarea
                        placeholder="This is the description of the chapter"
                        rows={3}
                        className="form-control block w-full px-3 py-1.5 text-md bg-gray-100 border hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100 font-normal text-gray-700 bg-clip-padding border-solid border-gray-300 rounded transition ease-in-out m-0 focus:outline-none"
                        value={
                          meta.chapterDescription ? meta.chapterDescription : ""
                        }
                        onChange={(e) => {
                          const chapterDescription = e.target.value;
                          const updated = {
                            ...meta,
                            ...{ chapterDescription },
                          };
                          setMeta(updated);
                        }}
                      ></textarea>
                    </div>
                    <div className="space-y-2">
                      <label className="font-medium text-gray-900 ">
                        Chapter Sequence Number
                      </label>
                      <input
                        type="number"
                        placeholder="1"
                        className="form-control block w-full px-3 py-1.5 text-md bg-gray-100 border hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100 font-normal text-gray-700 bg-clip-padding border-solid border-gray-300 rounded transition ease-in-out m-0 focus:outline-none"
                        value={meta.seq ? meta.seq : ""}
                        onChange={(e) => {
                          const seqValue = e.target.value;
                          const seq = parseInt(seqValue);
                          const updated = {
                            ...meta,
                            ...{ seq },
                          };
                          setMeta(updated);
                        }}
                      ></input>
                    </div>
                  </div>
                </div>
                <>
                  <p className="py-4 text-lg font-medium text-center">
                    Sections
                  </p>
                  <div className="flex flex-wrap justify-center">
                    {sectionData.map((sectionD, index) =>
                      sectionInfo(index, sectionD)
                    )}
                  </div>
                  <div className="flex justify-center py-2">
                    <button
                      className={`px-4 py-2 font-bold text-white bg-green-500 border-0 rounded focus:outline-none`}
                      onClick={(e) => {
                        e.preventDefault();
                        addSection();
                      }}
                    >
                      <div className="flex space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <p>Add Another Section</p>
                      </div>
                    </button>
                  </div>
                </>
                {checkAllMeta() && (
                  <div className="flex justify-center py-2">
                    <button
                      className={`px-8 py-2 font-bold text-white bg-blue-500 border-0 rounded focus:outline-none`}
                      type="submit"
                    >
                      <div className="flex space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <p>Publish Chapter</p>
                      </div>
                    </button>
                  </div>
                )}
              </form>
            </main>
          )}
        </div>
      </div>
      {isLoading && <LoadingScreen isLoading={isLoading} />}
    </div>
  );
};

export default createStory;

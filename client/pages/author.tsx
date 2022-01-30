import type { NextPage } from "next";
import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useMoralis } from "react-moralis";
import { XIcon } from "@heroicons/react/outline";
import axios from "axios";
import TopNav from "../components/TopNav";
import { Spinner } from "../components/Spinner";
import { StoryChapter } from "../pages/story/story";
import { showNotification } from "../utils/notification";

const Author: NextPage = () => {
  const [allOwnerStories, setAllOwnerStoryChapters] = useState<StoryChapter[]>(
    []
  );
  const [stories, setStories] = useState<StoryChapter[]>([]);
  const [storyChapters, setStoryChapters] = useState<StoryChapter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryChapter | null>(null);
  const [userId, setUserId] = useState("");
  const { isAuthenticated, Moralis, isWeb3Enabled, account, authenticate } =
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
      const chapterResponse = await axios.get("/api/chapters");
      const chaptersData: { [key: string]: string }[] = chapterResponse.data;
      const storyMap = new Map<string, StoryChapter>();
      const ownerStories = chaptersData.filter(
        (chapter) => chapter.ownerId === userId
      );
      for (const chapterData of ownerStories) {
        storyMap.set(`${chapterData.storyId}`, chapterData);
      }
      setAllOwnerStoryChapters(ownerStories);
      setStories(Array.from(storyMap.values()));
    } catch (err) {
      console.log(err);
      showNotification({
        message: "Error",
        description: "There was an issue loading assets",
      });
    }
    setIsLoading(false);
  };

  const showStoryDetails = (story: StoryChapter) => {
    const filteredByStory = allOwnerStories.filter(
      (storyItem) => storyItem.storyId === story.storyId
    );
    setStoryChapters(filteredByStory);
    setSelectedStory(story);
    setIsModalVisible(true);
  };

  return (
    <div className="mx-auto bg-gradient-to-t from-[#9bf8f4] to-[#6f7bf7]">
      <div className="mx-auto">
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
                {stories && stories.length > 0 && (
                  <h1 className="px-4 py-2 text-lg font-bold leading-relaxed sm:text-xl">
                    Your Authored Stories
                  </h1>
                )}
                <div
                  className={`flex ${
                    stories && stories.length > 0
                      ? "justify-end"
                      : "justify-center"
                  } px-4 pt-3`}
                >
                  <a
                    className="inline-block p-2 text-white bg-green-500 rounded hover:bg-green-600"
                    href="/createStory"
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
                      <p>Create A New Story</p>
                    </div>
                  </a>
                </div>
                <section>
                  {isLoading ? (
                    <div className="flex items-center justify-center pt-10">
                      <Spinner className="w-10 h-10 " />
                    </div>
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
              </>
            )}
          </main>
        </div>
      </div>
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
                      <ul className="flex flex-col space-y-1">
                        {storyChapters.map((value, index) => (
                          <li key={index}>
                            <a key={index} href={`/story/${value.ipfsId}`}>
                              <div className="font-medium">
                                {`${index + 1}. ${value.chapterTitle}`}
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-4">
                        <a
                          href={`/createStory?storyId=${storyChapters[0].storyId}`}
                          className="text-sm font-medium text-blue-700"
                        >
                          Create a new chapter
                        </a>
                      </div>
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

export default Author;

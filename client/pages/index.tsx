import type { NextPage } from "next";
import TopNav from "../components/TopNav";
import { useMoralis } from "react-moralis";

const Home: NextPage = () => {
  const { isAuthenticated, authenticate } = useMoralis();

  return (
    <div>
      <div className="mx-auto bg-white">
        <div className="flex flex-col h-screen">
          <TopNav />
          <main className="flex flex-col items-center justify-center text-black bg-center bg-no-repeat bg-cover">
            <h1 className="my-4 text-3xl font-bold text-gray-900 title-font">
              Crypto Adventures
            </h1>
            <p className="text-lg leading-relaxed text-center sm:text-xl md:px-32">
              Welcome stranger. You are invited to start on your journey to
              become a traveller of both time and space...
            </p>
            <section className="text-gray-700 bg-white">
              <div className="container flex flex-col items-center px-5 py-12 mx-auto">
                <div className="flex flex-wrap justify-center p-2 text-center">
                  <div className="w-full p-2 py-6 m-2 bg-white border rounded-lg shadow-lg sm:w-5/6 md:w-1/4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-flex w-16 h-16 mb-2 text-red-600 fill-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                    <h2 className="text-lg font-medium">Multiple Genres</h2>
                    <p className="p-2 text-sm">
                      One point in time you could be in the cold depths of space
                      and the next you could find yourself gunslinging in the
                      wild west!
                    </p>
                  </div>
                  <div className="w-full p-2 py-6 m-2 bg-white border rounded-lg shadow-lg sm:w-5/6 md:w-1/4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-flex w-16 h-16 mb-2 text-orange-600 fill-stroke"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                    <h2 className="text-lg font-medium">
                      Collect Unique Items
                    </h2>
                    <p className="p-2 text-sm">
                      As you navigate through the various stories, you will be
                      able to find pick up and collect secret items that are
                      yours to keep.
                    </p>
                  </div>
                  <div className="w-full p-2 py-6 m-2 bg-white border rounded-lg shadow-lg sm:w-5/6 md:w-1/4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-flex w-16 h-16 mb-2 text-green-600 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>

                    <h2 className="text-lg font-medium">
                      Create and Share Stories
                    </h2>
                    <p className="p-2 text-sm">
                      Create and promote your own adventure stories
                    </p>
                  </div>
                </div>
              </div>
            </section>
            {isAuthenticated ? (
              <>
                <p className="max-w-md text-lg">
                  Jump into your first story...
                </p>
                <a
                  href="/library"
                  className="inline-block px-10 py-3 mt-2 text-lg font-semibold text-white bg-red-500 rounded"
                >
                  Library
                </a>
              </>
            ) : (
              <button
                className="max-w-md p-2 mt-10 text-lg text-white bg-blue-500 rounded-lg hover:bg-blue-400"
                onClick={() =>
                  authenticate({
                    signingMessage: "Authenticate for Crypto Adventure!",
                  })
                }
              >
                Authenticate to get started
              </button>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;

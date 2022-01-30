import React from "react";
import Account from "./Account";
import Chains from "./Chains";

const TopNav = () => {
  return (
    <nav className="flex items-center justify-between px-5 py-2 text-white bg-gray-900">
      <ul className="flex">
        <li className="mr-6 hover:text-gray-300">
          <a className="font-medium" href="/">
            <img className="h-16 pt-1" src="/crypto_adventure.png"></img>
          </a>
        </li>
      </ul>
      <div className="flex">
        <ul className="flex mr-6">
          <li className="flex items-center mr-6 space-x-1 hover:text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              />
            </svg>
            <a href="/library">Library</a>
          </li>
          <li className="flex items-center mr-6 space-x-1 hover:text-gray-300">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <a href="/discover">Discover</a>
          </li>
          <li className="flex items-center space-x-1 hover:text-gray-300">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <a href="/author">Author</a>
          </li>
        </ul>
        <Chains />
        <Account />
      </div>
    </nav>
  );
};

export default TopNav;

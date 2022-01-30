import { useMoralis } from "react-moralis";
import Blockie from "./Blockie";
import { useState } from "react";
import Address from "./Address";
import { getExplorer } from "../helpers/networks";
import { getEllipsisTxt } from "../helpers/formatters";

function Account() {
  const { authenticate, isAuthenticated, logout, account, chainId } =
    useMoralis();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!isAuthenticated) {
    return (
      <button
        className="mr-6 hover:text-gray-200"
        onClick={() =>
          authenticate({ signingMessage: "Authenticate for Crypto Adventure!" })
        }
      >
        <p>Authenticate</p>
      </button>
    );
  }

  const Modal = () => {
    return (
      <div>
        <div className="fixed inset-0  mx-auto bg-gray-800 opacity-75 pointer-events-none"></div>
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="z-50 w-11/12 mx-auto overflow-y-auto bg-white rounded shadow-lg sm:max-w-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between pb-3 text-black">
                <p className="text-lg font-bold text-gray-900">Account</p>
                <button
                  onClick={() => {
                    setIsModalVisible(false);
                  }}
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col p-4 rounded-lg border mb-2">
                <div className="text-black text-xl font-semibold mb-2">
                  <Address
                    avatar="left"
                    size={6}
                    copyable
                    style={{ fontSize: "20px" }}
                  />
                </div>
                {chainId ? (
                  <a
                    className="flex text-blue-500"
                    href={`${getExplorer(chainId)}/address/${account}`}
                    target="_blank"
                    rel="noreferrer"
                  >
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    View on Explorer
                  </a>
                ) : (
                  ""
                )}
              </div>
              <div className="flex flex-col items-center p-2">
                <button
                  onClick={() => {
                    logout();
                    setIsModalVisible(false);
                  }}
                  className="rounded-lg bg-blue-500 p-3 text-white w-full hover:bg-blue-400"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        className="flex items-center"
        onClick={() => setIsModalVisible(true)}
      >
        <p className="mr-2">{account && getEllipsisTxt(account, 6)}</p>
        <Blockie currentWallet scale={3} />
      </button>
      {isModalVisible && <Modal />}
    </>
  );
}

export default Account;

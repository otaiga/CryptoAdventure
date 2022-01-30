import { useEffect, useState } from "react";
import { AvaxLogo, ETHLogo } from "./Logos";
import { useChain, useMoralis } from "react-moralis";

const menuItems = [
  // {
  //   key: "0x1",
  //   value: "Ethereum",
  //   icon: <ETHLogo />,
  // },
  {
    key: "0x539",
    value: "Local Chain",
    icon: <ETHLogo />,
  },
  // {
  //   key: "0x3",
  //   value: "Ropsten Testnet",
  //   icon: <ETHLogo />,
  // },
  // {
  //   key: "0x4",
  //   value: "Rinkeby Testnet",
  //   icon: <ETHLogo />,
  // },
  // {
  //   key: "0x2a",
  //   value: "Kovan Testnet",
  //   icon: <ETHLogo />,
  // },
  // {
  //   key: "0x5",
  //   value: "Goerli Testnet",
  //   icon: <ETHLogo />,
  // },
  // {
  //   key: "0x38",
  //   value: "Binance",
  //   icon: <BSCLogo />,
  // },
  // {
  //   key: "0x61",
  //   value: "Smart Chain Testnet",
  //   icon: <BSCLogo />,
  // },
  // {
  //   key: "0x89",
  //   value: "Polygon",
  //   icon: <PolygonLogo />,
  // },
  // {
  //   key: "0x13881",
  //   value: "Mumbai",
  //   icon: <PolygonLogo />,
  // },
  {
    key: "0xa86a",
    value: "Avalanche",
    icon: <AvaxLogo />,
  },
  {
    key: "0xa869",
    value: "Avalanche Fuji",
    icon: <AvaxLogo />,
  },
];

const Chains = () => {
  const { switchNetwork, chainId } = useChain();
  const [selected, setSelected] = useState<any>({});
  const [menuDisplay, setMenuDisplay] = useState(false);

  const {
    isWeb3Enabled,
    enableWeb3,
    isAuthenticated,
    isWeb3EnableLoading,
    account,
  } = useMoralis();

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled, account]);

  useEffect(() => {
    if (!chainId) return;
    const newSelected = menuItems.find((item) => item.key === chainId);
    if (newSelected) {
      setSelected(newSelected);
    }
  }, [chainId]);

  const handleMenuClick = (key: string) => {
    try {
      console.log("switch to: ", key);
      switchNetwork(key);
    } catch (_error) {
      console.log(_error);
      handleMenuClick(key);
    }
  };

  return (
    <div className="inline-block relative mr-6">
      <button
        className="flex border items-center border-white rounded-lg p-1"
        key={selected?.key}
        onClick={() => {
          setMenuDisplay(!menuDisplay);
        }}
      >
        <div className="mr-2">{selected?.icon}</div>
        <div className="hover:text-gray-300 mr-2">{selected?.value}</div>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      {menuDisplay && (
        <ul className="absolute bg-black">
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                key={item.key}
                className="flex py-2 px-2 hover:bg-gray-400"
                onClick={() => {
                  handleMenuClick(item.key);
                }}
              >
                <div className="mr-1">{item.icon}</div>
                <div className="hover:text-gray-300">{item.value}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Chains;

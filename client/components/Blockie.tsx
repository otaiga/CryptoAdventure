import Blockies from "react-blockies";
import { useMoralis } from "react-moralis";

/**
 * Shows a blockie image for the provided wallet address
 * @param {*} props
 * @returns <Blockies> JSX Elemenet
 */

const Blockie = (props: any) => {
  const { account } = useMoralis();
  if (!props.address && !account) {
    return <div>No account data</div>;
  }

  return (
    <Blockies
      seed={
        props.currentWallet
          ? account?.toLowerCase()
          : props.address.toLowerCase()
      }
      {...props}
    />
  );
};

export default Blockie;

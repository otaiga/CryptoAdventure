// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

// Remix contract instance: 0x77c0378b13DAA6A5ed07910541d621Ec80A8De6f

contract APIDecryptStory is ChainlinkClient {
    using Chainlink for Chainlink.Request;
 
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    mapping (bytes32 => address) requestIdToAddress;

    event StorySaved(address indexed sender, string cid);
    
    constructor() {
        setChainlinkToken(0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846);
        oracle = 0xE52F4aedAb0581df41fB5aBA4d46dda213C962f3;
        setChainlinkOracle(oracle);
        jobId = "d022b22d358a45f99f0042421fd4f3b6";
        fee = 0.1 * 10 ** 18;
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
    
    function requestDecrypt(string memory cid) public returns (bytes32) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        request.add("cid", cid);
        request.add("sender", toAsciiString(msg.sender));
        bytes32 requestId = sendChainlinkRequest(request, fee);
        requestIdToAddress[requestId] = msg.sender;
        return requestId;
    }
    
    function fulfill(bytes32 requestId, bytes memory cid) public recordChainlinkFulfillment(requestId)
    {
        address sender = requestIdToAddress[requestId];
        emit StorySaved(sender, string(cid));
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}

# Chainlink

## Contracts

As all story chapter are stored as encrypted files on Filecoin/IPFS. Therefore a Chainlink external adapter was used during the purchase flow to decrypt files and store against the users identifier in a Moralis database table/class.

This has the advantage of doing this processing off-chain which is more efficient for cost and performance reasons. It also has the added benefit of keeping the Symmetric encryption key off-chain and private.

### Operator

There are two required contracts, `Operator.sol` and `APIDecryptStory.sol`.

As we are running on Avalanche that isn't currently officially support it was necessary to deploy our own instance of the `Operator.sol` contract.

### APIDecryptStory

This contract provide the `request`/`fulfilment` functions needed by a Chainlink external adapter.

This `requestDecrypt` function receives the IPFS cid as a parameter. This is recognised by the Chainlink node which in turn calls the custom external adapter.

Once the external adapter has performed its work it calls the fulfilment function on the `APIDecryptStory` contract. The fulfilment function simple emits a `StorySaved` contract event.

## Jobspec

The Chainlink Jobspec `decryptStory.toml` orchestrates requests from the `APIDecryptStory` contract, the external adapter and the Chainlink node.

## External Adapter

This was generated by modifying the template provided here:

https://github.com/thodges-gh/CL-EA-NodeJS-Template

The `index.js` file holds the custom aspects of this adapter, particularly in the `createRequest` function.

The encrypted story chapter files are pulled down from Filecoin/IPFS storage using Web3.Storage. The files are decrypted using a helper library and then stored to the `Chapter` database table/class on the Moralis server.

The api key for Web3.Storage needs to be set in a `.env` file. Rename `.env.example` and fill in `WEB3STORAGE_API_KEY`.

## Docker

A Chainlink node was hosted in order to develop this solution. The respective `Dockerfile` and `docker-compose.yml` files have been included.

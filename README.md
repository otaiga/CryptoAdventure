# CryptoAdventure

This repository contains the source files for CryptoAdventure. CryptoAdventure is an entry into the 2021/22 Moralis/Avalanche Hackathon.

![Moralis/Avalanche Hackthon](/hackathon.png)

The solution makes ample use of the following technologies:

- Chainlink
- Filecoin/Web3.Storage/IPFS

and ofcourse:

- Moralis
- Avalanche

## What is it?

It's a "Choose Your Own Adventure" (CYOA) game platform written to take advantage of Web3.

Allows a player/reader to buy CYOA game chapters and play through. Web3 provides the added incentive of finding and owning rare NFT Collectibles minted by the story author into the chapter.

CYOA games have many genres. You are a traveller of both time and space. One scenario could have you battling dragons and saving villagers. Another scenario can be set in space where you are the commanding officer of a trawler carrying cargo to some far off colony.

## The Platform

The solution consists of the following components:

- Web application providing
  - Library - Quick access to purchased CYOA stories.
  - Discover - CYOA story marketplace.
  - Author - CYOA story chapter authoring interface.
  - Authentication - using Moralis SDK to login user via their Metamask wallet.

### Library

The library section provides a list of the CYOA stories that the authenticated user has purchase.

It also provides the list of collectible NFTs that a reader/player has found and collected whilst reading/playing CYOA stories.

### Discover

This page provides is where the catalogue of CYOA stories can be found. Currently only a small number of real stories are available, with the page showing the potential for search and discover as well as curated lists of CYOA stories.

When purchasing a story a request is made to the smart contract on Avalanche that in turns makes use of Chainlink to perform the decryption of the CYOA story JSON via its cid. The decrypted version is stored in the Moralis database/class where it is available to the web application.

### Author

This is a comprehensive story editor for creating new story chapters. It provides a lot of functionality for adding images, audio narration, logical actions and NFT collectibles to a chapter.

The author editor uploads image and audio files to Filecoin/IPFS, with the returned cids saved in the JSON blob that defines a CYOA story chapter.

The final story JSON is encrypted using a symmetric key and saved to Filecoin/IPFS.

## Developers

### Getting Started

Install all dependencies:

`./install.sh`

Then run the hardhat development server and client:

```bash
./start_local.sh
```

### The Client

Add to `.env.local` in the `/client` of this repo:

```
NEXT_PUBLIC_MORALIS_APPLICATION_ID=<NEXT_PUBLIC_MORALIS_APPLICATION_ID>
NEXT_PUBLIC_MORALIS_SERVER_URL=<NEXT_PUBLIC_MORALIS_SERVER_URL>
WEB3_API_TOKEN=<WEB3_API_TOKEN>
ENCRYPT_KEY=<ENCRYPT_KEY>
NEXT_PUBLIC_AVALANCHE_FUJI_URL=<SPEEDY_NODES_URL>
```

### Avalanche Test Network Requirements

To deploy to Fuji:

Add to `.env` in the root of this repo:

```
PRIVATE_KEY=<YOUR_ACCOUNT_PRIVATE_KEY>
WEB3_API_TOKEN=<WEB3_API_TOKEN>
ENCRYPT_KEY=<ENCRYPT_KEY>
MORALIS_APPLICATION_ID=<MORALIS_APPLICATION_ID>
MORALIS_SERVER_URL=<MORALIS_SERVER_URL>
AVALANCHE_FUJI_URL=<SPEEDY_NODES_URL>
```

This allows hardhat to deploy contracts to the Avalanche Fuji network.

run `npx hardhat run --network avalancheFuji ./scripts/deployFuji.ts`

Upload a basic story line:

run `npx hardhat run --network avalancheFuji ./scripts/deployAlienStory.ts`

### Local dev with Moralis server:

Moralis have a built-in proxy server to allow connection to the local devchain instance, just follow the steps bellow:

1. Download the version required depending on your hardware / os
   https://github.com/fatedier/frp/releases

2. Replace the following content in "frpc.ini", based on your devchain
   In some Windows Versions, FRP could be blocked by firewall, just use a older release, for example frp_0.34.3_windows_386

Mac / Windows Troubleshooting: https://docs.moralis.io/faq#frpc

```
Hardhat:
[common]
  server_addr = <ID>.usemoralis.com
  server_port = 7000
  token = <TOKEN>
[hardhat]
  type = http
  local_port = 8545
  custom_domains = <ID>.usemoralis.com

```

Then run `./frpc -c frpc.ini` from where you saved [frpc](https://github.com/fatedier/frp)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Moralis Server

#### Database tables/classes

The application uses some additional database tables as follows:

- `Chapter` - story chapters purchased and decrypted for a reader/player.
- `Chapters` - the metadata for a story chapter authored and available for puchase by a reader/player.
- `ChaptersOwned` - story chapters purchased by a reader/player.

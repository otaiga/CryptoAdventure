//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

interface ICollectible {
    // function mintToken(uint256, string memory) external returns (uint256 tokenId);
    function safeTransferFrom(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) external;

    function transferOwnership(
        address,
        uint256,
        uint256
    ) external;
}

contract StoryLibrary is ERC1155Holder {
    mapping(address => string[]) chaptersOwnedByBuyer;
    mapping(address => string[]) chaptersByAuthor;
    mapping(string => address) authorByCid;
    string[] chapters;
    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    // require(msg.sender == owner, "unauthorised"); -- good to know for guard clause

    function setChapter(string memory cid) public payable {
        require(msg.value == 0.01 ether, "Insufficient funds");
        address author = msg.sender;
        chaptersByAuthor[author].push(cid);
        authorByCid[cid] = author;
        chapters.push(cid);
    }

    function collectToken(address collectibleContract, uint256 tokenId) public {
        ICollectible(collectibleContract).transferOwnership(
            msg.sender,
            tokenId,
            1
        );
    }

    function getChapters() public view returns (string[] memory) {
        return chapters;
    }

    function getChaptersByAuthor() public view returns (string[] memory) {
        address author = msg.sender;
        return chaptersByAuthor[author];
    }

    function getChaptersOwnedByBuyer() public view returns (string[] memory) {
        address buyer = msg.sender;
        return chaptersOwnedByBuyer[buyer];
    }

    function purchaseChapter(string memory cid) public payable {
        require(msg.value == 0.01 ether, "Insufficient funds");
        address buyer = msg.sender;
        address author = authorByCid[cid];
        // check if buyer already has cid
        chaptersOwnedByBuyer[buyer].push(cid);
        // check author exists
        //require(author != address(0), "Author not found");
        //transfer funds to author
        (bool sent, ) = author.call{value: msg.value}("");
        require(sent, "Failed to transfer");
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public {
        payable(owner).transfer(address(this).balance);
    }
}

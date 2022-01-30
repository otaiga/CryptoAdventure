//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Collectibles is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address approvalAddress;

    mapping(address => uint256[]) private _tokenIdsByOwner;
    mapping(uint256 => address) private _minterByToken;
    mapping(uint256 => string) private _cids;
    mapping(uint256 => uint256) private _supplyByToken;

    constructor(address approvalAddress_) ERC1155("ipfs://") {
        approvalAddress = approvalAddress_;
    }

    function mintToken(uint256 amount, string memory cid)
        public
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _mint(msg.sender, tokenId, amount, "");
        setTokenUri(tokenId, cid);
        setApprovalForAll(approvalAddress, true);
        _minterByToken[tokenId] = msg.sender;
        _supplyByToken[tokenId] = amount;
        return tokenId;
    }

    function getOwnedTokens() public view returns (uint256[] memory) {
        return _tokenIdsByOwner[msg.sender];
    }

    function balanceRemaining(uint256 tokenId) public view returns (uint256) {
        address minter = _minterByToken[tokenId];
        require(minter != address(0), "Collectibles: Unknown token identifier");
        return balanceOf(minter, tokenId);
    }

    function tokenSupply(uint256 tokenId) public view returns (uint256) {
        return _supplyByToken[tokenId];
    }

    function setTokenUri(uint256 tokenId, string memory cid) internal {
        _cids[tokenId] = cid;
    }

    function transferOwnership(
        address to,
        uint256 tokenId,
        uint256 amount
    ) public {
        safeTransferFrom(_minterByToken[tokenId], to, tokenId, amount, "");
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(
            _minterByToken[tokenId] != address(0),
            "Collectibles: Unknown token identifier"
        );
        string memory prefix = super.uri(tokenId);
        return (string(abi.encodePacked(prefix, _cids[tokenId])));
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; i++) {
            _tokenIdsByOwner[to].push(ids[i]);
        }
    }

    function getCidForToken(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        return _cids[tokenId];
    }
}

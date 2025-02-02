// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundToken is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    constructor() ERC721("SkillSBT", "SKILL") Ownable(msg.sender) {}


    function mint(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }

    // Override `_update` to prevent transfers
    function _update(address to, uint256 tokenId, address auth) internal override returns (address){
        require(
            to == address(0) || ownerOf(tokenId) == address(0), 
            "SoulboundToken: Transfers are disabled"
        );
        return super._update(to, tokenId, auth);
    }
}

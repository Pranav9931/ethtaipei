// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RWA NFT with Conditional Transfer Control
 * @author pranavsan.eth
 * @notice This NFT represents a tokenized real-world asset (RWA). While a loan is active, the platform (owner) can transfer the NFT. Once the loan is repaid, transfer rights are revoked.
 */
 
contract RwaNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    struct Lock {
        bool isLocked;
        address lockedBy;
    }

    mapping(uint256 => Lock) public lockInfo;
    uint256 private _tokenIdCounter;

    event NFTMinted(address indexed to, uint256 indexed tokenId, string uri);
    event NFTLocked(uint256 indexed tokenId, address loanContract);
    event NFTUnlocked(uint256 indexed tokenId);
    event NFTSeized(uint256 indexed tokenId, address indexed seizedBy);

    constructor() ERC721("RealWorldAssetNFT", "RWANFT") Ownable(msg.sender) {}

    /**
     * @notice Mint NFT to user and lock it to loan contract
     */
    function mintWithLock(address to, string calldata uri, address loanContract) external onlyOwner returns (uint256) {
        uint256 tokenId = ++_tokenIdCounter;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);

        lockInfo[tokenId] = Lock({
            isLocked: true,
            lockedBy: loanContract
        });

        emit NFTMinted(to, tokenId, uri);
        emit NFTLocked(tokenId, loanContract);
        return tokenId;
    }

    /**
     * @notice Unlock NFT once loan is repaid
     */
    function unlock(uint256 tokenId) external {
        Lock storage lock = lockInfo[tokenId];
        require(lock.isLocked, "Already unlocked");
        require(msg.sender == lock.lockedBy, "Not authorized");

        lock.isLocked = false;
        lock.lockedBy = address(0);

        emit NFTUnlocked(tokenId);
    }

    /**
     * @notice Seize NFT from user if loan defaults
     */
    function seize(uint256 tokenId, address newOwner) external onlyOwner {
        Lock memory lock = lockInfo[tokenId];
        require(lock.isLocked, "Cannot seize unlocked NFT");
        address currentOwner = ownerOf(tokenId);
        _transfer(currentOwner, newOwner, tokenId);

        emit NFTSeized(tokenId, newOwner);
    }

    /**
     * @dev Override transfer functions to enforce lock restrictions
     */
    function _beforeTokenTransfer(
        uint256 tokenId
    ) internal view {
        Lock memory lock = lockInfo[tokenId];
        if (lock.isLocked) {
            require(msg.sender == owner() || msg.sender == lock.lockedBy, "NFT is locked");
        }
    }

    function tokenCounter() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice Check if token is currently locked
     */
    function isLocked(uint256 tokenId) external view returns (bool) {
        return lockInfo[tokenId].isLocked;
    }
}

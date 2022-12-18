//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    address payable owner;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;
    uint256 listPrice = 0.001 ether;

    constructor() ERC721("NFTMarketplace", "NFTMK") {
        owner = payable(msg.sender);
    }

    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

    mapping(uint256 => ListedToken) private idToListedToken;

    function updateListPrice(uint256 _listPrice) public payable {
        require(owner == msg.sender, "Logged-in user is not the owner and hence cannot update the listing price");
        listPrice = _listPrice;
    }

    function getListPrice() public view returns(uint256) {
        return listPrice;
    }

    function getLatestIdToLatestToken() public view returns (ListedToken memory) {
        uint256 currentTokenId = _tokenIds.current();
        return idToListedToken[currentTokenId];
    }

    function getListedForTokenId(uint256 tokenId) public view returns(ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getCurrentToken() public view returns(uint256) {
        return _tokenIds.current();
    }

    //write that stylish comments from week-2 alchemy course
    function createToken(string memory tokenURI, uint256 price) public payable returns(uint) {
        require(msg.value == listPrice, "Send enough ether to list the NFT");
        require(price > 0, "Make sure the price isn't negative");

        _tokenIds.increment();
        uint256 currentTokenId = _tokenIds.current();
        _safeMint(msg.sender, currentTokenId);
        _setTokenURI(currentTokenId, tokenURI);
        createListedToken(currentTokenId, price);
        return currentTokenId;
    }

    function createListedToken(uint256 tokenId, uint256 price) private {
        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        _transfer(msg.sender, address(this), tokenId);
    }

    function getAllNfts() public view returns(ListedToken[] memory) {
        //arrays actually need to know the count
        uint nftCount = _tokenIds.current();
        ListedToken[] memory tokens = new ListedToken[](nftCount);
        uint currentIndex = 0;
        for(uint i=0; i<nftCount; i++) {
            uint currentId = i+1;
            ListedToken storage currentItem = idToListedToken[currentId]; //why storage is used here?
            tokens[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return tokens;
    }

    function getMyNfts() public view returns(ListedToken[] memory) {
        uint nftCount = _tokenIds.current();
        uint itemsCount = 0;
        uint indexCount = 0;
        for(uint i=0; i<nftCount; i++) {
            uint currentId = i+1;
            if(idToListedToken[currentId].seller == msg.sender || idToListedToken[currentId].owner == msg.sender){
                itemsCount += 1;
            }
        }
        ListedToken[] memory items = new ListedToken[](itemsCount);
        for(uint i=0; i<nftCount; i++) {
            uint currentId = i+1;
            if(idToListedToken[currentId].seller == msg.sender || idToListedToken[currentId].owner == msg.sender){
                ListedToken storage itemToDisplay = idToListedToken[currentId]; //why use storage here again
                items[indexCount] = itemToDisplay;
                indexCount += 1;
            }
        }
        return items;
    }

    function executeSale(uint256 tokenId) public payable {
        uint256 price = idToListedToken[tokenId].price;
        require(msg.value == price, "Required Eth is not sent to purchase the NFT");
        _transfer(address(this), msg.sender, tokenId);
        approve(address(this), tokenId);
        address seller = idToListedToken[tokenId].seller;
        idToListedToken[tokenId].seller = payable(msg.sender);
        _itemsSold.increment();
        payable(owner).transfer(listPrice);
        payable(seller).transfer(price);
    }

}
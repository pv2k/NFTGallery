import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";

export default function NFTPage (props) {

const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");

async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    const tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getListedForTokenId(tokenId);
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    let item = {
        price: meta.price,
        tokenId: tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
    }
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr)
    updateCurrAddress(addr);
}

async function buyNFT(tokenId) {
    try {
        const ethers = require("ethers");
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const salePrice = ethers.utils.parseUnits(data.price, 'ether')
        updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
        //run the executeSale function
        let transaction = await contract.executeSale(tokenId, {value:salePrice});
        await transaction.wait();

        alert('You successfully bought the NFT!');
        updateMessage("");
    }
    catch(e) {
        alert("Upload Error"+e)
    }
}

    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched){
        console.log("Fetching NFT Data....");
        getNFTData(tokenId);
    }

    return(
        <div style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="flex justify-center h-screen">
                <img src={data.image} alt="" className="rounded-lg w-2/8 h-1/3" />
                <div className="text-xl ml-20 space-y-8 p-5">
                       <span className="text-base">{data.description}</span> <br/>
                       <span className="text-2xl font-bold">{data.name}</span> <br/><br/>
                       <span className="text-sm font-extralight">Price</span> <br/>
                       <span className="text-xl font-semibold">{data.price + " ETH"} ≈ $USD</span> <br/>
                    <div>
                    { currAddress == data.owner || currAddress == data.seller ?
                        <div className="text-[#FCD94D] text-sm font-bold">You are the owner of this NFT</div>
                        :
                        <button className="enableEthereumButton bg-[#FCD94D] hover:bg-[#FCD536] font-semibold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                    }
                    
                    <div className="mt-3 text-red text-sm">{message}</div>
                    </div>
                    <div className="border bg-[#FAFAFA] px-5 py-5">
                        <span className="text-sm">Owner Account: {data.owner}</span> <br/>
                        <span className="text-sm">Seller Account: {data.seller}</span> <br/>
                    </div>
                </div>
            </div>
        </div>
    )
}
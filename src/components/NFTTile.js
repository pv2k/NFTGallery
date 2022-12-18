import axie from "../tile.jpeg";
import {
    BrowserRouter as Router,
    Link,
  } from "react-router-dom";

function NFTTile (data) {
    const newTo = {
        pathname:"/nftPage/"+data.data.tokenId
    }
    return (
        <Link to={newTo}>
        <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl bg-slate-50">
            <img src={data.data.image} alt="NFT-image" className="w-72 h-80 rounded-lg object-cover" />

            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{data.data.name}</div>
                <p class="text-gray-700 text-base">
                    {data.data.description}
                </p>
            </div>
        </div>
        </Link>
    )
}

export default NFTTile;

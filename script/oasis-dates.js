// oasis-dates.js - shake it!

let isRunning = false;

async function shakeIt() {

    if (isRunning == false) {
        isRunning = true;
        
        // const provider = new ethers.providers.Web3Provider(window.ethereum);
        const provider = new ethers.providers.JsonRpcProvider('https://smartbch.greyh.at');

        const blockNum = await provider.getBlockNumber();   
        const queryPeriodHour = document.getElementById('query-period-hours').value;
        const queryPeriodBlock = queryPeriodHour * 60 * 60 / 5;
        const fromBlock = blockNum - queryPeriodBlock;
        const toBlock = blockNum;
        // console.log(blockNum);

        const marketContractAddress = '0x3b968177551a2aD9fc3eA06F2F41d88b22a081F7';   // Oasis New
        const marketContract = new ethers.Contract(marketContractAddress, NftExV2Abi, provider);

        const nftContractAddress = '0x87aA4eF35454fEF0B3E796d20Ab609d3c941F46b';  // Smart Waifu

        let events;
        let contractEvent = '';

        if (document.getElementById('query-type').value === 'query-listed') {
        
            // contractEvent = 'MakeOrder';
            const eventFilter = marketContract.filters.MakeOrder(nftContractAddress);
            events = await marketContract.queryFilter(eventFilter, fromBlock, toBlock);

            document.getElementById('list-of-waifus').innerHTML = `<p>[MakeOrder events from block ${fromBlock} to block ${toBlock}]</p><br>`;
            // for (let i = 0; i < events.length; i++) {
            for (let i = events.length-1; i >= 0; i--) {
                const orderHash = events[i].args[2];
                const tokenId = events[i].args[1];
                const seller = events[i].args[3];
                
                const nftCurrentPrice = await marketContract.getCurrentPrice(orderHash);
                const nftCurrentPriceBCH = nftCurrentPrice / 1e18;
                const orderInfo = await marketContract.orderInfo(orderHash);
                // console.log(orderInfo);
                const auctionType = ['Fixed Price', 'Dutch Auction', 'English Auction'];
        
                const nftContract = new ethers.Contract(nftContractAddress, ERC721Abi, provider);
        
                const nftURI = await nftContract.tokenURI(tokenId);
                const nftJSON = await fetchJSON(nftURI);
        
                let [kjlastname, kjfirstname, lastname, firstname] = nftJSON.name.split(/ /);
                firstname = firstname.slice(0,-1);
                lastname = lastname.toUpperCase().slice(1);
                const paddingSpaces = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                const padding = paddingSpaces.slice(0, Math.floor((24 - firstname.length - lastname.length) / 2) * 6);
        
                document.getElementById('list-of-waifus').innerHTML += 
                    `<span class="nftdisplay"><span class="nfttext">Smart Waifu #${tokenId} listed for ${nftCurrentPriceBCH} BCH [${auctionType[orderInfo[0]]}]</span><span class="waifu-name-kj">${kjlastname}&nbsp;&nbsp;${kjfirstname}</span><a href="${nftJSON.image}" target="_blank"><img src="${nftJSON.image}" width=280 height=280></a><span class="waifu-name">${padding}${firstname} ${lastname}${padding} ${nftJSON.attributes[0]["value"]}&nbsp;&nbsp;${nftJSON.attributes[1]["value"]}&nbsp;&nbsp;${nftJSON.attributes[2]["value"]}</span><span class="nfttext">check it out on <a href="https://oasis.cash/token/${nftContractAddress}/${tokenId}" target="_blank">OASIS&thinsp;<img src="icons8-external-link-16_goldish.png"></a></span></span>`;
                    // '<p>Token ID: ' + tokenId + '<br> Seller: ' + seller + '<br> Order Hash: ' + orderHash + '<br>' +
                    // `<img src="${nftJSON.image}" width=300 height=300><br> Current Price: ` + 
                    // nftCurrentPriceBCH + ` BCH @ ${auctionType[orderInfo[0]]} | sold? ${orderInfo[10]} | cancelled? ${orderInfo[11]} | ` + 
                    // `<a href="https://oasis.cash/token/${nftContractAddress}/${tokenId}" target="_blank">check it out on OASIS&thinsp;<img src="icons8-external-link-16_goldish.png"></a> | <a href="${nftURI}" target="_blank">check attributes&thinsp;<img src="icons8-external-link-16_goldish.png"></a></p><br>`;
            }

        }
        else if (document.getElementById('query-type').value === 'query-sold') {

            // contractEvent = 'Claim';
            const eventFilter = marketContract.filters.Claim(nftContractAddress);
            events = await marketContract.queryFilter(eventFilter, fromBlock, toBlock);
            // console.log(events);

            document.getElementById('list-of-waifus').innerHTML = `<p>[Claim events from block ${fromBlock} to block ${toBlock}]</p><br>`;
            // for (let i = 0; i < events.length; i++) {
            for (let i = events.length-1; i >= 0; i--) {
                // event Claim(IERC721 indexed token, uint256 id, bytes32 indexed hash, address seller, address indexed taker, uint256 price);
                const tokenId = events[i].args[1];
                // const orderHash = events[i].args[2];
                const nftSellPrice = events[i].args[5];
                const nftSellPriceBCH = nftSellPrice / 1e18;

                const nftContract = new ethers.Contract(nftContractAddress, ERC721Abi, provider);
            
                const nftURI = await nftContract.tokenURI(tokenId);
                const nftJSON = await fetchJSON(nftURI);

                let [kjlastname, kjfirstname, lastname, firstname] = nftJSON.name.split(/ /);
                firstname = firstname.slice(0,-1);
                lastname = lastname.toUpperCase().slice(1);
                const paddingSpaces = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                const padding = paddingSpaces.slice(0, Math.floor((24 - firstname.length - lastname.length) / 2) * 6);

                document.getElementById('list-of-waifus').innerHTML += 
                    `<span class="nftdisplay"><span class="nfttext">Smart Waifu #${tokenId} sold for ${nftSellPriceBCH} BCH</span><span class="waifu-name-kj">${kjlastname}&nbsp;&nbsp;${kjfirstname}</span><a href="${nftJSON.image}" target="_blank"><img src="${nftJSON.image}" width=280 height=280></a><span class="waifu-name">${padding}${firstname} ${lastname}${padding} ${nftJSON.attributes[0]["value"]}&nbsp;&nbsp;${nftJSON.attributes[1]["value"]}&nbsp;&nbsp;${nftJSON.attributes[2]["value"]}</span></span>`;
            }
        }

        isRunning = false;
    }
}


async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}

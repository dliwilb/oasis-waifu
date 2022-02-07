// connectWalletAndNetwork.js
// connect wallet and switch network

async function onConnect() {

    await connectWallet();
    if (isWalletConnected == true){
        await switchNetwork();
        if (isNetworkConnected == true){
            await getMintFee();
        }
    }

}

async function connectWallet() {

    if (window.ethereum) {
        try {
            const connectedAccount = await window.ethereum.request({ method: 'eth_requestAccounts' });
            isWalletConnected = true;
            document.getElementById('connected-address').value = connectedAccount;
            logToConsoleAndPage('log: wallet connected');
        }
        catch (error) {
            if (error.code === 4001) {
                logToConsoleAndPage('log: connection rejected by user');
            }

            logToConsoleAndPage('log: cannot connect to wallet');
        }
    }

}

async function switchNetwork(){
 
    const chainIdTo = '0x2710';
    const chainIdToName = 'smartBCH';
    // const chainIdTo = '0x4';
    // const chainIdToName = 'Testnet Rinkeby';

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIdTo }],
        });

        isNetworkConnected = true;
        logToConsoleAndPage(`log: switched to ${chainIdToName}`);
    }
    catch (error) {
        if (error.code === 4001) {
            logToConsoleAndPage(`log: user rejected network switch to ${chainIdToName}`);
        }

        logToConsoleAndPage(`log: cannot switch to ${chainIdToName}`);
        console.log(isWalletConnected);
        console.log(isNetworkConnected);
    }    
}
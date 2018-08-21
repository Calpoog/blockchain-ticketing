import Web3 from 'web3';

const getWeb3 = function () {
    return new Promise((resolve, reject) => {
        // Wait for loading completion to avoid race conditions with web3 injection timing.
        window.addEventListener('load', function (dispatch) {
            // Checking if Web3 has been injected by the browser (Mist/MetaMask)
            if (typeof window.web3 !== 'undefined') {
                console.log('Injected web3 detected.');

                const web3instance = new Web3(web3.currentProvider);

                // makes it easier to test stuff in the browser console when the web3 matches the project version
                window.web3 = web3instance;

                // Use Mist/MetaMask's provider.
                resolve(web3instance);
            } else {
                // Fallback to localhost if no web3 injection.
                console.log('No web3 instance injected, using Local web3.');

                var provider = new Web3.providers.HttpProvider('http://localhost:8545');

                resolve(new Web3(provider));
            }

            // TODO: Error checking.
        });
    });
};

export default getWeb3;

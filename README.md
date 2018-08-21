# Project Title

An event/ticketing system built on the Ethereum blockchain. This project was created for Consensys Academy 2018.

## Getting Started

You will need to install npm 

### Prerequisites

npm is required for this project to work.

Truffle is required to compile and deploy contracts to a local test blockchain.

```
npm install truffle -g
```

To run this project locally you will also need ganache. You can download the GUI version of ganache at
https://truffleframework.com/ganache. Further instructions will use the ganache-cli.

```
npm install -g ganache-cli
```

Download and install Metamask for Chrome browser at https://metamask.io/

### Install and run

Do an npm install in the blockchain-ticketing folder to get all local dependencies

```
npm install
```

Start a local ethereum blockchain with ganache-cli

```
ganache-cli
```

Copy the mnemonic shown in the console. This lets you recall the default account for the ganache blockchain.
Open the Metamask plugin in your browser and use the dropdown at the top to select "Localhost 8545." At the bottom,
click "Import using account seed phrase." This could open a new window where you have to select "import using seed phrase"
again. Once you get to the textarea for pasting the seed phrase, paste the mnemonic you copied from the console and
choose a password to use for the next time logging into Metamask.

Run the web front-end

```
npm run start
```

This should compile the front-end and open it in browser. If not, make note of the port shown in the console
and open the http://localhost:port. If done correctly you should be viewing the web page and the main address
in Metamask should be displayed at the top of the web page in the blue header.


## Running the tests

Before running the tests you must have a local blockchain running using the ganache-cli

```
ganache-cli
```

The tests for the solidity contracts are run using truffle. First enter the truffle console

```
truffle console
```

Compile the contracts once in the console by running the compile command

```
compile
```

Once this completes, migrate the contracts to the ganache blockchain using the migrate command

```
migrate
```

Finally, the tests can be run with the test command. There should be 19 passing tests.

```
test
```

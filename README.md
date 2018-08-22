# Blockchain Ticketing

An event/ticketing system built on the Ethereum blockchain. This project was created for Consensys Academy 2018.
This allows any user to create a simple named event with a price and total supply of tickets. The tickets use
the ERC 721 standard so they are non-fungible and can be continually traded for resale. Tickets can be bought
for an event and the owner of the ticket can prove ownership at the time of the event using a one-time code
generated by the event host. After proving validity and ownership of the ticket, the event host can redeem
the ticket and allow the participant to enter the event.

*I have provided an entire section detailing how this project meets each grading rubric requirement to make
it easy on those grading the project. Please scroll all the way down to find this. If you run into a problem
while grading please reach out to be via email (calpoog@gmail.com) or in the Ryver course chat (@Calpoog)*

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

### Using the web interface

Make sure you are signed into Metamask. If not, sign in and then refresh the web page. You should see Metamask's primary
account address displayed in the web page header.

![alt text](https://github.com/Calpoog/blockchain-ticketing/raw/master/readme-images/1.png)

By default you view the "Participant view." This is what those looking to buy tickets and see their ticket
collection would see. In order to buy a ticket, there first must be events in the system. Switch to the
"Event Host view" by clicking "Host Event" in the header. Here you can create an event by filling out the form.
Name your event, price the tickets (in wei), and determine how many total tickets will be sold. Click create and
Metamask will pop up asking you to confirm the transaction. Confirm and you should see a new event appear in the
"My Events" list. You can create as many events as you'd like. Each event will be assigned a numeric ID. This is important
for buying tickets. An event host would share their event's ID via some kind of marketing.

![alt text](https://github.com/Calpoog/blockchain-ticketing/raw/master/readme-images/2.png)

To buy a ticket from an event you've created, switch back to the Participant view by clicking "Participate" in the header.
Under "Find Events" type in the ID of one of the events you created (They start with ID 0 and increment) and click find. A section should appear showing the details of the event: Event name, ticket price (in wei), total tickets, and tickets remaining. There is also a picture of a kitten for future expansion to IPFS.

![alt text](https://github.com/Calpoog/blockchain-ticketing/raw/master/readme-images/3.png)

Next, purchase a ticket from a found event using the "Buy" button. This will prompt a Metamask popup and once you confirm a new ticket should appear under "My Tickets."

![alt text](https://github.com/Calpoog/blockchain-ticketing/raw/master/readme-images/4.png)

Suppose you purchased a ticket to the State Fair. Now that you have a ticket from an event on the blockchain, the next step
is to redeem that ticket at the event. You would go to the State Fair, and like most events, there would be people scanning
tickets at the entrance. In this case you don't have a physical ticket, but instead a blockchain ticket and by the nature
of blockchain, you have to prove that you have ownership of that ticket (since anyone can see public data on the blockchain
anyone can see the details of every event and ticket). In order to provide proof that undoubtedly shows ownership, it must
be done at the time of redemption. The person scanning the ticket will provide a one-time code that you can then use
to create a special cryptographic signature of that code that the event host can use to validate that you are the owner of
the ticket. Once the event host validates you own the ticket, they can redeem the ticket on the blockchain and let you enter.

For demo purposes, you will be functioning as both the Event Host and Participant. Open a new Chrome tab and go to the
same URL and make sure you are in the "Host Event" section. Click the "Redeem Tickets" button for the event you wish
to redeem tickets for. This will display a popup with a button to generate a one-time code. Click this button and a 4
number/letter code will appear. More fields will appear, but for now just copy the one time code.

<img src="https://github.com/Calpoog/blockchain-ticketing/raw/master/readme-images/5.png" width="400" />
<img src="https://github.com/Calpoog/blockchain-ticketing/raw/master/readme-images/6.png" width="400" />

Move back to your Chrome tab with the Participant view open. Click "Prove Ownership" on a ticket you bought from the above
event. A popup will appear where you can enter the code from the event host. Paste in the code and click "Generate Proof."
You will receive a Metamask prompt to sign a message. This message is a combination of the ID of the ticket and the code
you entered. This generates a QR code. Normally, the event host would scan your QR code but for demo purposes this is
difficult when using the same computer for both host and participant and no mobile phones. I have provided a text box
below it with the data that is encoded in the QR code. Copy this data (it is long).

<img src="https://github.com/Calpoog/blockchain-ticketing/raw/master/readme-images/7.png" width="400" />
<img src="https://github.com/Calpoog/blockchain-ticketing/raw/master/readme-images/8.png" width="400" />

Back in your Host Event tab, paste the data you just copied into the "QR Ticket Data" field in the popup you left open.
Click "Check Validity." If the ticket is valid and the participant's QR ticket data proved their ownership it will display
"Ticket valid!" Try changing the number before the comma or the signature data after the comma and clicking "Check Validity"
to see what would happen if the data was invalid. Once it reads "Ticket valid!" you can click "Redeem" to redeem the
ticket. Metmask will again prompt for a transaction and once confirmed the popup will read "Ticket redeemed." You can
continue to click "Generate Code" to make new codes to validate other tickets for this event.

<img src="https://github.com/Calpoog/blockchain-ticketing/raw/master/readme-images/9.png" width="400" />

That's it! You've successfully been both a blockchain Event Host and Participant with public, immutable, non-fungible tickets.
This eliminates fake tickets and can be used to eliminate middle-men for ticket purchasing and reselling. Rules could
also be assigned to the selling of tickets to limit resale or the value of resale.


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

Finally, the tests can be run with the test command.

```
test
```

# Grading rubric requirements

Here I outline how this project meets each of the requirements in the grading rubric. Hopefully this makes it
easier for you to identify things without spending too much time!

## User interface requirements

### Run app on a dev server locally for testing/grading
If you've followed the above instructions, this is complete. The contracts run in the ganache-cli blockchain and
the front end runs in the browser when starting with npm.

### Should be able to visit URL and interact with the app
If setup properly, the app should be running on a localhost URL.

### The applications should have the following features
Display the current account - This is displayed in the blue header of the web app
Sign transactions using metamask / uPort - Transactions to create an event, buy a ticket, and redeem tickets are all signed using Metamask.
Reflect updates to to the contract state - New events appear in the UI after creating a new event on the blockchain. Same for tickets after buying from an event.

## Testing

### 5 tests with with explanations

Each contract (Ticket and Event) has more than 5 tests. The test descriptions are sort of implicit with the test
it('description'), but I'll expand upon the tests here.

For both contracts I test that they have correct addresses set for one another. They need references to the other in order
for the Event contract to mint (buy) new tickets, and for the Ticket contract to verify that mint and redeem requests
only come from the Event contract.

The event contract tests are fairly simple. I needed to test for all the edge cases of creating, buying and redeeming tickets.
There is no wrong way to create an event, so validating that new events are added is enough. For buying, edge cases like
trying to buy a ticket to a non-existent event and making sure you can only by tickets with the appropriate amount of ETH
were tested. Lastly it tests that a ticket can be redeemed (which is only valid from the event contract) and that the
redeemed status of a redeemed ticket works properly.

The ticket contract inherits ERC721 EthPM/npm package from openzeppelin. By virtue of this, I did not need to test any of
the ERC721 features, only those that I layered on top of it. Thus, I test that only the Event contract can call the protected
method to mint (buy) and redeem tickets. It also tests that tickets can be validated and redeemed and the failure cases
for those.

### Tests are properly structured

All tests follow standard format. They set up context, execute the testable code, then verify that the code worked
(or reverted) properly according to the test description.

### Tests provide adequate coverage for the contracts

The tests cover all functions and their error cases.

### All tests pass

This should be shown while following the testing procedure.

## Design pattern requirements

### Implement a circuit breaker / emergency stop

The Ticket contract's write functions are protected by only coming from the Event contract. Read functions would still be
fine in the event of an emergency that needs to stop the code.

The Event contract implements an emergency stop from the owner. This prevents all writeable functions from running,
effectively making only reading event/ticket data possible in the case of an emergency, which prevents any further damage.

### Other design patterns used

In addition to circuit breaker, this project uses the following design patterns:

Ownership - Each contract is Ownable and has an owner that allows certain features like the emergency stop or updating the address that each points to the other

Restricting Access - The Ticket contract restricts access to some functions to calls from the Event contract. Both contracts
restrict access to multiple functions based on event owner.

Fail Early and Fail Loud - For error conditions in both contracts, require() statements are used to enforce proper calling. This causes reverts before state data can be altered.

## Security Tools / Common Attacks

### Explain what measures they’ve taken to ensure that their contracts are not susceptible to common attacks

I've evaded most common attack channels by avoiding their main causes: storing ETH, performing math, and calling external
contracts. These can lead to problems like unexpected reverts when refunding, exploits around the withdrawal pattern,
under/overflow, and reentrancy.

The only try math my contracts do is subtracting 1 from tickets an event has when buying. This avoids underflow because
the number is hardcoded (the user can't specify anything that could cause problems) and happens after the check that
tickets are greater than 0.

I validate on buy that the amount of ETH sent is exactly the amount necessary to buy the ticket. This means a user can't
buy a ticket for cheaper than it costs, but more importantly means I do not have to send extra ETH bath to the owner which
can cause DoS if it was a contract with a reverting fallback function.

No recursion or heavy computing is done to avoid stack depth issues and running out of gas.

## Library / EthPM

### At least one contract uses a library or EthPM package

The Ticket contract uses openzeppelin-solidity EthPM/npm package (I used npm, CourseQuestions confirmed this is okay, in order
to make installation easier. Only an npm install is required instead of also a truffle install).

The Ticket contract by inheriting from ERC721 also uses the SafeMath library. The math functions provided are used in one of
the functions I've extended.

## Additional Requirements

### Smart Contract code should be commented according to the specs in the documentation

All contract functions are commented using the spec documentation with descriptions, params and returns.

## Stretch goals

### Testnet Deployment

Contracts deployed on the Rinkeby test network

Ticket.sol - 0x9d25f512ceedd161164f538fa4ddfc716f7c6def
Event.sol - 0xdad344793a6b9e2b8e918d734f177b848e7fae04

There is one event created (event ID 0) and two tickets has been bought from it.
The first ticket (ticket ID 0) has been redeemed.

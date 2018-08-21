import React, { Component } from 'react';
import { connect } from 'react-redux';
import getWeb3 from './util/web3/getWeb3';
import { addContract } from './contracts/contractsActions';
import { addTicket } from './tickets/ticketsActions';
import { addEvent } from './events/eventsActions';
import EventArtifact from '../build/contracts/Event.json';
import TicketArtifact from '../build/contracts/Ticket.json';
import { Link, IndexLink } from 'react-router';
//import truffleContract from 'truffle-contract';

// Styles
import './css/open-sans.css'
import './css/pure-min.css'
import './css/grids-responsive-min.css'
import './css/spacing.css';
import './index.css';
import './App.css'

export const WEB3_INITIALIZED = 'WEB3_INITIALIZED';
export const USE_ACCOUNT = 'USE_ACCOUNT';
function web3Initialized(web3) {
    return {
        type: WEB3_INITIALIZED,
        web3
    }
}

function useAccount(account) {
    return {
        type: USE_ACCOUNT,
        account
    }
}

// Unfortunately this is necessary to prevent web3 caching calls to view functions
let _nonce = Math.round((Math.random() + 1) * 1000000);
export const nonce = () => _nonce++;

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            web3Initialized: false
        };
    }

    componentWillMount() {
        this.init();
    }

    async init() {
        const web3 = await getWeb3();

        this.props.web3Initialized(web3);
        this.setState({ web3Initialized: true });

        const accounts = await web3.eth.getAccounts();

        web3.defaultAccount = accounts[0];

        if (accounts.length) this.props.useAccount(web3.defaultAccount);

        const networkId = await web3.eth.net.getId();

        // get the latest block for when we query for past events. This allows us to use the specific
        // block number instead of 'latest' which remains cached even after new blocks are mined.
        const blockNumber = await web3.eth.getBlockNumber();

        console.log('Block Number: ', blockNumber);

        const ticketContract = makeContract(web3, TicketArtifact, networkId);
        const eventContract = makeContract(web3, EventArtifact, networkId);

        this.props.addContract('Ticket', ticketContract);
        this.props.addContract('Event', eventContract);

        const ticketsIds = await ticketContract.methods.tokenOfOwner(web3.defaultAccount).call({ gas: nonce() });
        console.log('ticket IDs for ', web3.defaultAccount, ticketsIds);

        const tickets = await Promise.all(
                ticketsIds.map(ticketId => 
                    ticketContract.methods.tickets(ticketId)
                        .call({ gas: nonce() })
                        // add the ticket ID to its structure
                        .then(ticket => ({ ...ticket, id: ticketId }))
                )
            )

        // add the ticket's event directly to the ticket object
        const events = await Promise.all(
            // get all event IDs for user's tickets
            [...new Set(tickets.map(ticket => ticket.eventId))]
                .map(id =>
                    eventContract.methods.events(id)
                        .call({ gas: nonce() })
                        // add the event ID to its structure
                        .then(event => ({ ...event, id }))
                )
        );

        tickets.forEach(ticket => {
            ticket.event = events.find(event => ticket.eventId === event.id);
        });

        this.props.addTicket(tickets);
        console.log('tickets', tickets);

        // get all events created by this user
        const myEvents = await eventContract.getPastEvents('EventCreated', {
                filter: { creator: web3.defaultAccount },
                fromBlock: 0,
                toBlock: 'latest'
            })
            .then(logs => Promise.all(logs.map(log => eventContract.methods.events(log.returnValues.eventId)
                .call({ gas: nonce() })
                // add the event ID to its structure
                .then(event => ({ ...event, id: log.returnValues.eventId }))))
            );

        this.props.addEvent(myEvents);

        console.log('events', myEvents);
    }

    render() {
        return (
            <div className="App">
                <header>
                    <div className="container">
                        <div className="address">Address <span className="text-mono margin-left-sm">{this.props.account}</span></div>
                        <IndexLink to='/' activeClassName="is-active">Participate</IndexLink>
                        <Link activeClassName='is-active' to="/host">Host Event</Link>
                    </div>
                </header>
                {this.state.web3Initialized ? this.props.children : null}
            </div>
        );
    }
}

// Because truffle-contract does not completely work with new web3 1.0.0-beta.34
// due to send vs sendAsync on the HttpProvider, we'll just use web3 1.0 APIs
// as truffle-contract doesn't provide too much extra.
function makeContract(web3, artifact, networkId) {
    return new web3.eth.Contract(artifact.abi, artifact.networks[networkId].address);
}

export default connect((state) => ({ account: state.account }), { addTicket, addEvent, addContract, web3Initialized, useAccount })(App);

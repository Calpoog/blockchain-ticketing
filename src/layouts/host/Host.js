import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addEvent } from '../../events/eventsActions';
import { nonce } from '../../App';

class Host extends Component {

    constructor(props) {
        super(props);

        this.state = {
            name: undefined,
            price: undefined,
            numTickets: undefined,
            code: undefined,
            isRedeemable: 0,
            data: undefined,
            eventId: undefined,
            redeeming: false,
            redeemSuccess: false
        };

        this.createEvent = this.createEvent.bind(this);
        this.generateCode = this.generateCode.bind(this);
        this.checkValidity = this.checkValidity.bind(this);
        this.redeem = this.redeem.bind(this);
        this.qrData = this.qrData.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.redeemPopup = this.redeemPopup.bind(this);
    }

    async createEvent() {
        const { name, price, numTickets } = this.state;

        const receipt = await this.props.eventInstance.methods.createEvent(name, price, numTickets).send({ from: this.props.web3.defaultAccount });
        const eventId = receipt.events.EventCreated.returnValues.eventId;
        const event = await this.props.eventInstance.methods.events(eventId).call();

        this.eventName.value = '';
        this.eventPrice.value = '';
        this.eventTickets.value = '';

        event.id = eventId;
        this.props.addEvent(event);
    }

    generateCode() {
        this.setState({
            code: this.props.web3.utils.sha3(Date.now().toString()).substr(2, 4),
            redeemSuccess: false,
            isRedeemable: 0
        });
    }

    async checkValidity() {
        const web3 = this.props.web3;
        const { ticketId, signature } = this.state.data;
        // this is the message that the user would have signed
        const msgHash = web3.utils.sha3(ticketId + this.state.code);
        // get the signature components to send to the contract
        const r = `0x${signature.slice(0, 64)}`;
        const s = `0x${signature.slice(64, 128)}`;
        let v = web3.utils.hexToNumber(`0x${signature.slice(128, 130)}`);
        if (v < 2) v += 27;

        console.log('isRedeemable', this.state.eventId, ticketId, msgHash, v, r, s);
        const isRedeemable = await this.props.ticketInstance.methods.isRedeemable(this.state.eventId, ticketId, msgHash, v, r, s).call({ gas: nonce() });
        console.log(isRedeemable);
        this.setState({ isRedeemable: parseInt(isRedeemable, 10) });
    }

    async redeem() {
        const { eventInstance } = this.props;
        const { eventId, data: { ticketId } } = this.state;

        try {
            await eventInstance.methods.redeemTicket(ticketId, eventId).send({ from: this.props.web3.defaultAccount });
            this.setState({
                redeemSuccess: true,
                code: ''
            });
        } catch (e) {
            // error
            console.error(e);
        }
    }

    qrData(e) {
        const [ticketId, signature] = e.target.value.split(',');

        this.setState({ data: { ticketId, signature }});
    }

    redeemableStatus() {
        switch (this.state.isRedeemable) {
            case 1: return 'Ticket already redeemed.';
            case 2: return 'Ticket does not exist.';
            case 3: return 'User does not own ticket.';
            case 4: return 'Ticket does not belong to this event.';
            case 5: return 'Ticket valid!';
            default: return undefined;
        }
    }

    redeemPopup(eventId) {
        this.setState({
            eventId,
            redeeming: true
        });
    }

    closePopup() {
        this.setState({
            eventId: undefined,
            data: undefined,
            code: '',
            redeeming: false,
            redeemSuccess: false
        });
    }
    
    render() {
        const redeemableStatus = this.redeemableStatus();
        return (
            <main>

                <section className="margin-bottom-lg padding-bun-lg bg-light">
                    <div className="container">
                        <h2 className="title margin-bottom-md">Create An Event</h2>

                        <div className="margin-bottom-md">
                            <label className="hidden" htmlFor="event-name">Event Name</label>
                            <input ref={e => this.eventName = e} placeholder="Event Name" type="text" id="event-name" name="event-name" onChange={(e) => this.setState({ name: e.target.value })} />
                        </div>
                        <div className="margin-bottom-md">
                            <label className="hidden" htmlFor="event-price">Price</label>
                            <input ref={e => this.eventPrice = e} placeholder="Price (in wei)" type="text" id="event-price" name="event-price" onChange={(e) => this.setState({ price: e.target.value })} />
                        </div>
                        <div className="margin-bottom-md">
                            <label className="hidden" htmlFor="event-tickets">Total Tickets</label>
                            <input ref={e => this.eventTickets = e} placeholder="Total Tickets" type="text" id="event-tickets" name="event-tickets" onChange={(e) => this.setState({ numTickets: e.target.value })} />
                        </div>
                        <button onClick={this.createEvent}>Create</button>
                    </div>
                </section>
                
                <section className="container">
                    <h2 className="title margin-bottom-sm">My Events</h2>
                    <div className="events pure-g">
                        {Object.keys(this.props.events).map((eventId, i) => {
                            const event = this.props.events[eventId];
                            return !event ? null : <div className="event pure-u-1 pure-u-sm-1-2 pure-u-md-1-3 pure-u-lg-1-4" key={i}>
                                <div className="event__wrap">
                                    <h3 className="margin-bottom-md">{event.name}</h3>
                                    <p className="margin-bottom-md">Event ID: <span className="text-mono">{event.id}</span></p>
                                    <p className="text-light margin-bottom-sm">{event.price} wei</p>
                                    <p className="margin-bottom-sm">{event.totalTickets} tickets</p>
                                    <p className="margin-bottom-md">{event.remainingTickets} remaining</p>
                                    <button className="full" onClick={() => this.redeemPopup(eventId)}>Redeem Tickets</button>
                                </div>
                            </div>
                        })}
                    </div>
                </section>

                {!this.state.redeeming ? null :
                    <div className="overlay">
                        <div className="popup">
                            <div className="popup__close" onClick={this.closePopup}>&#x2715;</div>
                            <h2 className="text-lg text-bold margin-bottom-md">Event {this.state.eventId}</h2>

                            <p className="margin-bottom-md text-sm">
                                Generate a one-time code per participant. They can use this code to prove their
                                ownership of a ticket, providing a QR code to scan to check for validity.
                            </p>
                            <div className="pure-g margin-bottom-md">
                                <button onClick={this.generateCode}>Generate Code</button>
                                <div className="event-code pure-u fill text-lg padding-left-md">{this.state.code}</div>
                            </div>
                            {this.state.redeemSuccess ? <div className="text-lg">Ticket redeemed!</div> : null}
                            {this.state.code ?
                                <div>
                                    <p className="margin-bottom-sm text-sm">
                                        For demo purposes, paste the ticket QR data here to validate a ticket
                                    </p>
                                    <input className="full" type="text" placeholder="QR Ticket Data" onChange={this.qrData} />
                                    <button className="full margin-top-sm" onClick={this.checkValidity}>Check Validity</button>
                                    {redeemableStatus ? <div className="margin-top-sm">{redeemableStatus}</div> : null}
                                    <button className="green full margin-top-md" disabled={this.state.isRedeemable !== 5} onClick={this.redeem}>Redeem</button>
                                </div>
                                : null
                            }
                        </div>
                    </div>
                }
            </main>
        )
    }
}

export default connect(
    state => ({
        web3: state.web3,
        eventInstance: state.contracts.Event,
        ticketInstance: state.contracts.Ticket,
        events: state.events,
        tickets: state.tickets
    }),
    { addEvent }
)(Host);
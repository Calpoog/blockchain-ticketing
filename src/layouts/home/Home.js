import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addTicket } from '../../tickets/ticketsActions';
import { addEvent } from '../../events/eventsActions';
import Ticket from '../../components/ticket/Ticket';
import QRious from 'qrious';

class Home extends Component {

    constructor(props) {
        super(props);

        this.state = {
            eventId: undefined,
            foundEvent: undefined,
            eventError: '',
            ticketId: undefined,
            code: '',
            signature: undefined,
            proving: false,
            data: undefined,
        };

        this.findEvent = this.findEvent.bind(this);
        this.createQR = this.createQR.bind(this);
        this.proveOwnership = this.proveOwnership.bind(this);
        this.closePopup = this.closePopup.bind(this);
    }

    findEvent() {
        this.props.eventInstance.methods.events(this.state.eventId).call().then(foundEvent => {
            foundEvent.id = this.state.eventId;
            this.setState({ foundEvent, eventError: '' });
        }).catch(() => this.setState({ eventError: 'Event not found!' }));
    }

    async buy(event) {
        try {
            const receipt = await this.props.eventInstance.methods
                .buyTicket(event.id)
                .send({ value: parseInt(event.price, 10), from: this.props.web3.defaultAccount })

            console.log(receipt);
            const ticketId = receipt.events.BoughtTicket.returnValues.ticketId;
            // new ticket so no need to gas nonce
            const ticket = await this.props.ticketInstance.methods.tickets(ticketId).call();

            ticket.id = ticketId;
            ticket.event = event;

            this.props.addTicket(ticket);
        } catch (e) {
            console.error(e);
        }
    }

    proveOwnership(ticketId) {
        this.setState({
            ticketId,
            proving: true
        });
    }

    closePopup() {
        this.setState({
            ticketId: undefined,
            data: undefined,
            signature: undefined,
            code: '',
            proving: false
        });
    }

    async createQR() {
        const web3 = this.props.web3;
        const ticketId = this.state.ticketId;
        const msgHash = web3.utils.sha3(ticketId + this.state.code);

        console.log('proveOwnership', ticketId, this.state.code, msgHash);
        const signature = ticketId + ',' + (await web3.eth.personal.sign(msgHash, web3.defaultAccount)).slice(2);

        this.setState({
            signature,
            qr: (new QRious({ value: signature, size: 320 })).toDataURL()
        });
    }
    
    render() {
        const { foundEvent, eventError } = this.state;
        return (
            <main>
                <section className="margin-bottom-lg padding-bun-lg bg-light">
                    <div className="container">
                        <h2 className="title margin-bottom-sm">Find Events</h2>
                        <div className="pure-g">
                            <input placeholder="Event ID" type="text" id="eventId" name="eventId" onChange={(e) => this.setState({ eventId: e.target.value })} />
                            <button className="margin-left-sm" onClick={this.findEvent}>Find</button>
                        </div>

                        {foundEvent && !eventError ? 
                            <div className="event-result margin-top-md">
                                <img alt="Event" src="http://placekitten.com/200/300" />
                                <div className="margin-left-md event-result__content">
                                    <h3 className="text-lg text-bold margin-bottom-md">{foundEvent.name}</h3>
                                    <p className="margin-bottom-sm text-light">{foundEvent.price} wei</p>
                                    <p className="margin-bottom-sm">{foundEvent.totalTickets} Total Tickets</p>
                                    <p className="margin-bottom-md">{foundEvent.remainingTickets} Remaining</p>
                                    <p className="margin-bottom-sm">Always validate the event contract owner before buying!</p>
                                    <p className="margin-bottom-md text-mono">{foundEvent.owner}</p>
                                    <button onClick={() => this.buy(foundEvent)}>Buy</button>
                                </div>
                            </div> : null}
                        {eventError ? <div>{eventError}</div> : null}
                    </div>
                </section>

                <section className="container">
                    <h2 className="title margin-bottom-sm">My Tickets</h2>
                    <div className="tickets pure-g">
                        {Object.keys(this.props.tickets).map((ticketId, i) => {
                            const ticket = this.props.tickets[ticketId];
                            return <Ticket key={i} ticket={ticket} proveOwnership={this.proveOwnership}></Ticket>
                        })}
                    </div>
                </section>

                {!this.state.proving ? null :
                    <div className="overlay">
                        <div className="popup">
                            <div className="popup__close" onClick={this.closePopup}>&#x2715;</div>
                            <h2 className="text-lg text-bold margin-bottom-sm">Ticket {this.state.ticketId}</h2>
                            {this.state.signature ?
                                <div>
                                    <img alt="QR Code" src={this.state.qr} />
                                    <p className="margin-top-md margin-bottom-sm text-sm">
                                        For demo purposes, this input contains the data encoded in the QR Code. To use as
                                        the event host, copy and paste into "Ticket QR Data" textbox when validating a ticket.
                                    </p>
                                    <input className="popup__data full" type="text" disabled value={this.state.signature} />
                                </div> :
                                <div className="margin-top-md">
                                    <p className="margin-bottom-sm text-sm">
                                        Enter the one-time code generated by the event host to generate a QR code for
                                        validating and redeeming your ticket.
                                    </p>
                                    <input className="full" type="text" placeholder="One time code" onChange={(e) => this.setState({ code: e.target.value })} />
                                    <button className="full margin-top-md" onClick={this.createQR}>Generate Proof</button>
                                </div>
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
    { addTicket, addEvent }
)(Home);
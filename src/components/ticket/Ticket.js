import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import './Ticket.css';

class Ticket extends Component {

    static propTypes = {
        web3: PropTypes.any.isRequired,
        ticket: PropTypes.object.isRequired,
        proveOwnership: PropTypes.func.isRequired
    };

    render() {
        const event = this.props.ticket.event;
        return (
            <div className="ticket pure-u-1 pure-u-sm-1-2 pure-u-md-1-3 pure-u-lg-1-4">
                <div className="ticket__wrap">
                    <h3 className="margin-bottom-md">{event.name}</h3>
                    <p className="ticket__price text-light margin-bottom-sm">{event.price} wei</p>
                    <button className="full margin-top-md" onClick={() => this.props.proveOwnership(this.props.ticket.id)}>
                        Prove Ownership
                    </button>
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        web3: state.web3
    })
)(Ticket);
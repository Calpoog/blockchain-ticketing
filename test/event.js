var Event = artifacts.require('./Event.sol');
var Ticket = artifacts.require('./Ticket.sol');

contract('Event', function (accounts) {
    let eventInstance;
    let ticketInstance;

    before(async function () {
        eventInstance = await Event.deployed();
        ticketInstance = await Ticket.deployed();
    });

    it('should have the correct address for Ticket contract', async function () {
        const ticketAddress = await eventInstance.ticketAddress.call();

        assert.equal(ticketAddress, ticketInstance.address);
    });

    it('non-owner cannot update Ticket contract address', async function () {
        try {
            await eventInstance.updateTicketAddress(accounts[1], { from: accounts[1] });
            assert(false, 'transaction was incorrectly successful');
        } catch(e) {
            const newTicketAddress = await eventInstance.ticketAddress.call();

            assert.equal(newTicketAddress, ticketInstance.address);
        }
    });

    it('owner can update Ticket contract address', async function () {
        const originalAddress = (await Ticket.deployed()).address;

        await eventInstance.updateTicketAddress(accounts[1]);

        let ticketAddress = await eventInstance.ticketAddress.call();

        assert.equal(ticketAddress, accounts[1]);

        // put it back for future tests
        await eventInstance.updateTicketAddress(originalAddress);

        ticketAddress = await eventInstance.ticketAddress.call();

        assert.equal(ticketAddress, originalAddress);
    });

    it('can create a new event', async function () {
        // using .call() does not persist data, but allows us to get the return value
        // in order to validate that it works properly
        const newEventID = await eventInstance.createEvent.call('Event 1', 2000, 20);
        assert.equal(newEventID, 0);

        // Call createEvent normally, where we can't get return value, but the state
        // is saved to the blockchain
        await eventInstance.createEvent('Event 1', 2000, 20);
        const newEvent = await eventInstance.events.call(0);

        assert.equal(newEvent[0], 'Event 1');
        assert.equal(newEvent[1].toNumber(), 2000);
        assert.equal(newEvent[2].toNumber(), 20);
        assert.equal(newEvent[3].toNumber(), 20);
        assert.equal(newEvent[4], accounts[0]);
    });

    it('properly creates a new Event ID for additional events', async function () {
        // check that creating a new event here will increment ID to 1 (state not saved with .call())
        assert.equal(await eventInstance.createEvent.call('Event 1', 2000, 20), 1);
    });

    // this test also proves that Event contract is successfull in calling 'buy' on Ticket
    it('can buy a ticket', async function () {
        // check that it properly returns a ticket ID
        const ticketId = await eventInstance.buyTicket.call(0, { value: 2000 });
        assert.equal(ticketId, 0);

        await eventInstance.buyTicket(0, { value: 2000 });

        const event = await eventInstance.events.call(0);

        // check that the number of tickets decremented
        assert.equal(event[3], 19);

        // check that a ticket has been minted
        const ticket = await ticketInstance.tickets.call(ticketId);

        // ticket's eventId should match the ID of the event we bought from
        // struct has only one member right now, so it doesn't come back as an array
        assert.equal(ticket[0].toNumber(), 0);

        // ticket should belong to the buyer
        assert.equal(await ticketInstance.ownerOf.call(0), accounts[0]);

        // buyer should have a balance of 1
        assert.equal(await ticketInstance.balanceOf.call(accounts[0]), 1);
    });

    it('can\'t sell a ticket to a non-existent event', async function () {
        try {
            await eventInstance.buyTicket(5, { value: 2000 });
            fail('Invalid succeed in buying ticket that doesn\'t exist');
        } catch (e) { }

        // Remaining tickets should still be 19
        const event = await eventInstance.events.call(0);

        assert.equal(event[3], 19);
    });

    it('must not sell a ticket if the ETH value sent does not match the price', async function () {
        // under
        try {
            await eventInstance.buyTicket(0, { value: 1200 });
            fail('Invalid succeed in buying ticket with not enough ETH');
        } catch(e) { }

        // over
        try {
            await eventInstance.buyTicket(0, { value: 2200 });
            fail('Invalid succeed in buying ticket with too much ETH');
        } catch (e) { }

        // Remaining tickets should still be 19
        const event = await eventInstance.events.call(0);

        assert.equal(event[3], 19);
    });

    it('can redeem a ticket from Event contract', async function () {
        try {
            await eventInstance.redeemTicket(0, 0);
            const ticket = await ticketInstance.tickets.call(0);
            assert.isTrue(ticket[1] /* 1 index is redeemed */, 'Redeemed status was not true after redemption');
        } catch (e) {
            assert(false, 'Failed to redeem ticket ' + e);
        }
    });

    // This is technically a ticket test but it has to come after redemption which can only be done via Event contract/tests
    it('can check that ticket is no longer redeemable', async function () {
        const result = await ticketInstance.isRedeemable.call(0, 0, ...proveTicketOwnership(0, 1234, accounts[0]));

        assert.equal(result, 1);
    });

});

function proveTicketOwnership(ticketId, code, account) {
    const msgHash = web3.sha3(ticketId + code);
    const sig = web3.eth.sign(account, msgHash).slice(2);
    const r = `0x${sig.slice(0, 64)}`;
    const s = `0x${sig.slice(64, 128)}`;
    let v = web3.toDecimal(`0x${sig.slice(128, 130)}`);
    if (v < 2) v += 27;

    return [msgHash, v, r, s];
}

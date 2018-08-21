var Ticket = artifacts.require('./Ticket.sol');
var Event = artifacts.require('./Event.sol');

contract('Ticket', async function (accounts) {
    let eventInstance;
    let ticketInstance;
    
    before(async function() {
        eventInstance = await Event.deployed();
        ticketInstance = await Ticket.deployed();

        // create an event and buy a ticket from it
        await eventInstance.createEvent('Event 1', 2000, 20);
        await eventInstance.buyTicket(0, { value: 2000 });
    });

    it('should have the correct address for Event contract', async function () {
        const eventAddress = await ticketInstance.eventAddress.call();

        assert.equal(eventAddress, eventInstance.address);
    });

    it('non-owner cannot update Event contract address', async function () {
        try {
            await ticketInstance.updateEventAddress(accounts[1], { from: accounts[1] });
            assert(false, 'transaction was incorrectly successful');
        } catch (e) {
            const newEventAddress = await ticketInstance.eventAddress.call();

            assert.equal(newEventAddress, eventInstance.address);
        }
    });

    it('owner can update Ticket contract address', async function () {
        const originalAddress = eventInstance.address;

        await ticketInstance.updateEventAddress(accounts[1]);

        let eventAddress = await ticketInstance.eventAddress.call();

        assert.equal(eventAddress, accounts[1]);

        // put it back for future tests
        await ticketInstance.updateEventAddress(originalAddress);

        eventAddress = await ticketInstance.eventAddress.call();

        assert.equal(eventAddress, originalAddress);
    });

    it('cannot be bought from any contract but the Event contract', async function () {
        try {
            await ticketInstance.buy(accounts[0], 0);
            assert(false, 'Calling buy from non-Event contract should fail');
        } catch (e) { }
    });

    it('can validate a ticket', async function () {
        const result = await ticketInstance.isValid.call(0, 0, ...proveTicketOwnership(0, 1234, accounts[0]));

        assert.equal(result, 5);
    });

    it('fails if ticket does not exist', async function () {
        const result = await ticketInstance.isValid.call(0, 99, ...proveTicketOwnership(99, 1234, accounts[0]));

        assert.equal(result, 2);
    });

    it('does not validate a ticket not owned by address', async function () {
        const result = await ticketInstance.isValid.call(0, 0, ...proveTicketOwnership(0, 1234, accounts[1]));

        assert.equal(result, 3);
    });

    it('can check that ticket is redeemable', async function () {
        const result = await ticketInstance.isRedeemable.call(0, 0, ...proveTicketOwnership(0, 1234, accounts[0]));

        assert.equal(result, 5);
    });

    it('can\'t redeem a ticket from an address that is not the Event contract', async function () {
        try {
            await ticketInstance.redeem(0, 0);
            assert(false, 'Calling redeem from an address other than Event contract should fail');
        } catch (e) { }
    });

    // test for whether Event contract can redeem is in the event tests

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

var Ticket = artifacts.require("Ticket");
var Event = artifacts.require("Event");

module.exports = function(deployer) {
  deployer.deploy(Ticket, 0).then(() => {
    return deployer.deploy(Event, Ticket.address)
      .then(async () => {
        const eventInstance = await Event.deployed();
        const ticketInstance = await Ticket.deployed();

        console.log('Event address is ', eventInstance.address);
        ticketInstance.updateEventAddress(eventInstance.address);
      });
  });
};

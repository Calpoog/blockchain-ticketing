pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Ticket.sol";

/**
 * @title Event contract for creating/managing events
 */
contract Event is Ownable {
    
    // Address of the Ticket contract
    address public ticketAddress;
    
    struct EventData {
        // string name of the event
        string name;
        // face value price of tickets (in wei)
        uint price;
        // total number of tickets offered
        uint totalTickets;
        // number of tickets remaining
        uint remainingTickets;
        // owner address of the event
        address owner;
    }
    
    // All events
    EventData[] public events;

    /**
     * @dev Called each time an event is created
     */
    event EventCreated(uint indexed eventId, address indexed creator);

    /**
     * @dev Called each time a new ticket is minted (bought directly from event)
     */
    event BoughtTicket(uint indexed ticketId, address indexed buyer);

    /**
     * @dev Called each time a ticket is redeemed
     */
    event RedeemedTicket(uint indexed ticketId);
    
    constructor(address _ticketAddress) public {
        ticketAddress = _ticketAddress;
    }
    
    /**
     * @dev Changes the address of the associated Ticket contract
     * @param _ticketAddress address The new Ticket contract address
     */
    function updateTicketAddress(address _ticketAddress) external onlyOwner {
        ticketAddress = _ticketAddress;
    }
    
    /**
     * @dev Creates a new event
     * @param name string String name of event
     * @param price uint Price in wei of the Tickets
     * @param totalTickets Total number of tickets for this event
     * @return id uint ID of the newly created event
     */
    function createEvent(string name, uint price, uint totalTickets) external returns (uint) {
        uint id = events.push(EventData(name, price, totalTickets, totalTickets, msg.sender)) - 1;
        emit EventCreated(id, msg.sender);
        return id;
    }
    
    /**
     * @dev Buy a new ticket from event
     * @param eventId uint ID of the event to buy a ticket from
     */
    function buyTicket(uint eventId) external payable returns (uint) {
        // Event must exist
        require(events[eventId].owner != 0, "Even does not exist");

        // There must be tickets left
        require(events[eventId].remainingTickets > 0, "There are no remaining tickets");
        
        // The payment must be exact to the price of the ticket
        // This avoids the necessity for refunds (potential reentrancy) or
        // for withrawal schemes.
        require(msg.value == events[eventId].price, "Payment did not match event ticket price");
        
        // Mint a new ticket
        Ticket ticketContract = Ticket(ticketAddress);
        uint ticketId = ticketContract.buy(msg.sender, eventId);
        
        // Decrement tickets remaining
        events[eventId].remainingTickets--;

        emit BoughtTicket(ticketId, msg.sender);
        
        return ticketId;
    }

    /**
    * @dev Redeems the ticket with given id. This would be called after the
    * event organizer has checked isRedeemable() on the ticket.
    * @param ticketId uint ID of the ticket to redeem
    * @param eventId uint ID of the event the ticket belongs to
    */
    function redeemTicket(uint ticketId, uint eventId) external {
        // The event must exist
        address owner = events[eventId].owner;
        require(owner > 0, "The event does not exist");

        // The caller must be the owner of the event
        require(msg.sender == owner, "Sender must be the owner of the event");

        Ticket ticketContract = Ticket(ticketAddress);

        // Validation that the ticket belongs to the event happens in Ticket contract
        ticketContract.redeem(ticketId, eventId);
    }
}
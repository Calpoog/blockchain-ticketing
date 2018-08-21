pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol";

/**
 * @title Ticket implementation using ERC721 standard plus additions
 * @dev Tickets are ERC721 with additional information and transfer restrictions
 */
contract Ticket is Ownable, ERC721BasicToken {
    
    // Address of the Event contract, which has permission to mint tickets
    address public eventAddress;
    
    // Ticket-specific information tied to underlying ERC721
    struct TicketData {
        uint256 eventId;
        bool redeemed;
    }
    
    // All tickets. IDs are simply the index
    // Essentially a mapping uint256 => TicketData
    TicketData[] public tickets;

    // Mapping from owner to list of owned token IDs
    mapping(address => uint256[]) internal ownedTokens;

    // Mapping from token ID to index of the owner tokens list
    mapping(uint256 => uint256) internal ownedTokensIndex;
    
    /**
     * @dev Throws if called by any account other than the Event contract.
     */
    modifier onlyEventContract() {
        require(msg.sender == eventAddress, "Sender must be Event contract");
        _;
    }
    
    constructor(address _eventAddress) public {
        eventAddress = _eventAddress;
    }
    
    /**
     * @dev Changes the address of the associated Event contract
     * @param _eventAddress address The new Event contract address
     */
    function updateEventAddress(address _eventAddress) external onlyOwner {
        eventAddress = _eventAddress;
    }
    
    /**
     * @dev Validates a ticket as being owned by an address and that the ticket
     * is valid for the provided event ID. The event host will give the attendee
     * a one-time code. The attendee will provide their ticket ID and a signature
     * of the sha3(ticket ID + one-time code). From this the event host can determine
     * at time-of-entry that the attendee is the owner of a valid ticket.
     * @param eventId uint256
     * @param ticketId uint256
     * @param msgHash bytes32 Hash of the ticketId + event one-time code
     * @param v uint8 v of signature of msgHash
     * @param r bytes32 r of signature of msgHash
     * @param s bytes32 s of signature of msgHash
     * @return uint8 an integer representing the result.
     * 2 = ticket does not exist
     * 3 = signature does not match the owner of the ticket
     * 4 = ticket does not belong to the event
     * 5 = valid ticket
     */
    function isValid(
        uint256 eventId,
        uint256 ticketId,
        bytes32 msgHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (uint8) {
        // Ticket must exist; this is easy since ticket IDs are just array indices
        if (ticketId >= tickets.length) return 2;

        // The provided signature must be from the address that owns the ticket
        if (recovery(msgHash, v, r, s) != tokenOwner[ticketId]) return 3;
        
        // The ticket must belong to the Event
        if (tickets[ticketId].eventId != eventId) return 4;
        
        return 5;
    }

    /**
     * @dev Validates a ticket as being owned by an address and that the ticket
     * is valid for the provided event ID as well as being unredeemed. An extra
     * check over isValid.
     * @param eventId uint256
     * @param ticketId uint256
     * @param msgHash bytes32 Hash of the ticketId+attendee
     * @param v uint8 v of signature of msgHash
     * @param r bytes32 r of signature of msgHash
     * @param s bytes32 s of signature of msgHash
     * @return uint8 an integer representing the result.
     * 1 = ticket already redeemed
     * 2 = ticket does not exist
     * 3 = signature does not match the owner of the ticket
     * 4 = ticket does not belong to the event
     * 5 = valid ticket
     */
    function isRedeemable(
        uint256 eventId,
        uint256 ticketId,
        bytes32 msgHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (uint8) {
        // this repeats a check from isValid, but is necessary to make sure the next check doesn't fail
        // if the provided ticketId doesn't exist
        if (ticketId >= tickets.length) return 2;
        
        if (tickets[ticketId].redeemed) return 1;

        return isValid(eventId, ticketId, msgHash, v, r, s);
    }

    /**
    * @dev Validates a signed message hash with given v, r, c for ecrecover
    * @param msgHash bytes32 Hash of a message
    * @param v uint8 v of signature of msgHash
    * @param r bytes32 r of signature of msgHash
    * @param s bytes32 s of signature of msgHash
    */
    function recovery(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) private pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, msgHash));
        return ecrecover(prefixedHash, v, r, s);
    }

    /**
     * @dev Redeems a ticket by ID. Only callable by Event contract where auth takes place
     * @param ticketId uint256 The ID of the ticket to redeem
     */
    function redeem(uint256 ticketId, uint256 eventId) external onlyEventContract {
        require (ticketId < tickets.length, "Ticket does not exist");
        require (tickets[ticketId].eventId == eventId, "Ticket does not belong to the event");

        tickets[ticketId].redeemed = true;
    }
    
    /**
     * @dev Buys a new ticket from event. Only callable by Event contract
     * @param buyer address The address the new ticket will be owned by
     * @param eventId uint256 The event the ticket is being bought from
     */
    function buy(address buyer, uint256 eventId) external onlyEventContract returns (uint256) {
        uint256 id = tickets.push(TicketData(eventId, false)) - 1;
        _mint(buyer, id);
        
        return id;
    }

    /**
     * @dev Gets the tokens of requested owner
     * @param _owner address owning the tokens list to be accessed
     * @return uint256[] array of token IDs owned by the requested address
     */
    function tokenOfOwner(address _owner)
        public
        view
        returns (uint256[])
    {
        return ownedTokens[_owner];
    }

    /**
     * The following implementation is taken from ERC721Token.sol
     * Did not want to have all the functionality of the full spec token
     * But needed the owned tokens list functionality
     */

    /**
     * @dev Gets the token ID at a given index of the tokens list of the requested owner
     * @param _owner address owning the tokens list to be accessed
     * @param _index uint256 representing the index to be accessed of the requested tokens list
     * @return uint256 token ID at the given index of the tokens list owned by the requested address
     */
    function tokenOfOwnerByIndex(address _owner, uint256 _index)
        public
        view
        returns (uint256)
    {
        require(_index < balanceOf(_owner), "Token index out of owners token list bounds");
        return ownedTokens[_owner][_index];
    }

    /**
     * @dev Internal function to add a token ID to the list of a given address
     * @param _to address representing the new owner of the given token ID
     * @param _tokenId uint256 ID of the token to be added to the tokens list of the given address
     */
    function addTokenTo(address _to, uint256 _tokenId) internal {
        super.addTokenTo(_to, _tokenId);
        uint256 length = ownedTokens[_to].length;
        ownedTokens[_to].push(_tokenId);
        ownedTokensIndex[_tokenId] = length;
    }

    /**
     * @dev Internal function to remove a token ID from the list of a given address
     * @param _from address representing the previous owner of the given token ID
     * @param _tokenId uint256 ID of the token to be removed from the tokens list of the given address
     */
    function removeTokenFrom(address _from, uint256 _tokenId) internal {
        super.removeTokenFrom(_from, _tokenId);

        uint256 tokenIndex = ownedTokensIndex[_tokenId];
        uint256 lastTokenIndex = ownedTokens[_from].length.sub(1);
        uint256 lastToken = ownedTokens[_from][lastTokenIndex];

        ownedTokens[_from][tokenIndex] = lastToken;
        ownedTokens[_from][lastTokenIndex] = 0;
        // Note that this will handle single-element arrays. In that case, both tokenIndex and lastTokenIndex are going to
        // be zero. Then we can make sure that we will remove _tokenId from the ownedTokens list since we are first swapping
        // the lastToken to the first position, and then dropping the element placed in the last position of the list

        ownedTokens[_from].length--;
        ownedTokensIndex[_tokenId] = 0;
        ownedTokensIndex[lastToken] = tokenIndex;
    }
}
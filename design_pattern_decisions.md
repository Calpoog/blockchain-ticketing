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

As for why other design patterns were not used - they simply were not needed. Things such as withdrawal patterns and contract factories
were not necessary to work with the ticketing/event system.
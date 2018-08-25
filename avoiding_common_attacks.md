## Security Tools / Common Attacks

### Explain what measures they’ve taken to ensure that their contracts are not susceptible to common attacks

I've evaded most common attack channels by avoiding their main causes: storing ETH, performing math, and calling external
contracts. These can lead to problems like unexpected reverts when refunding, exploits around the withdrawal pattern,
under/overflow, and reentrancy.

The only math my contracts do is subtracting 1 from tickets an event has when buying. This avoids underflow because
the number is hardcoded (the user can't specify anything that could cause problems) and happens after the check that
tickets are greater than 0.

I validate on buy that the amount of ETH sent is exactly the amount necessary to buy the ticket. This means a user can't
buy a ticket for cheaper than it costs, but more importantly means I do not have to send extra ETH back to the owner which
can cause DoS if it was a contract with a reverting fallback function.

Poison data was not too much of a consideration, but if expanded upon I would check for input sanitation on both front
and back-end. For now, it is possible to put in negative numbers for both price and tickets, resulting in unreasonably
large unsigned integers stored in the contract. All this does is prevent any user from being able to buy a ticket from
an event created this way. Putting in non-numeric values for price and tickets leads to front end errors. Form validation 
within the front end and some solidity-side sanity checks could remove these edge-cases.

No recursion or heavy computing is done to avoid stack depth issues and running out of gas.

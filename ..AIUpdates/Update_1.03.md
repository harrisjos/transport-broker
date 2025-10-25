# Update 1.03

## Testing

Build Verbose Testing for all actions

## API Responses

All API Data Transfers should be JSON Only.
All Errors will be handled client side.

## Dashboard

Returns 404 This page could not be found.

## Profile

Returns 404 This page could not be found.

## Post Jobs

Returns the login page.
Should only be avalble to logged in Shipper Users.

## Browse Jobs

No Jobs - assuming this is expected.
Should only be available to logged in Carrier Users.
Jobs should be "cards", single line per job.

## Create Platform user (Application Admin)

This user should be able to view and edit the backend UI tables.

## Booking Request Bid Screen (Carrier)

This screen should only be viewable to carrier users.
This should allow carriers to bid for the work.
Each bid should have the following attributes;

- Amount $
- Expiry Date
- Collection Date
- Delivery Date
- Notes - free text
- Conditions (Make conditions a table of options with a default set options)

## Booking Request Bid Screen (Shipper - Review)

Show the details of the bid, allowing the shipper user the ability to review and accept / decline the bid

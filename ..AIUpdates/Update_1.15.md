# Update 1.15

## New DB Migration

Add a new table to the db for statuses
Statuses

Primary statuses are divisble by 10, this allows us to add sub-statues later if required

Id,Name,Colour
0, Draft, #eceaeaff
10, Requested, #fffb0085
20, Under Offer, #ffae0085
30, Accepted, #00ddff85
40, In Transit, #009dff85
50, Delivered, #0026ff85
60, Pod Received, #22ff0085
1000, Dispute, #ff000085
5000, Complete, #6fff0085
9000, Cancelled, #ff828285

## Navbar

Browse Bookings and Dashboard links are both to the dashboards, remove "browse jobs"

## Bookings

<http://localhost:3000/bookings>
404
This page could not be found.

## Dashboard

Logged in as John Customer
Should see 2 bookings, see 0 bookings

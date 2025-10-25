# Updated 1.01

## NavBar

The Navbar should be persistent across all pages
It should also be fixed at the top and always visible.

## Users & Organistions

All Users Should belong to an Company (With the option to create a new one or choose "Individual/Sole Trader", where the Company Details are that of the individual)
Lets call These Orgnaisations
A Organisation can have multiple Users
A Single User can be attached to multiple organisation.

Users must have roles: Admin (Each Organisation must have at least 1 - admins can alter organisations details) or User

Organisations should be either be Shipper or Carrier

### Register and Log In

Create a Register Controller
Username (user email) and Password (With minimum requirements)
This will set up 1 new user and 1 new organisation.

#### Sub Register

Additional Users to an organisation can only be added through an admin backend.

## Jobs (Freight - to be referred to in the App as Bookings)

The Shipper creates a new "booking request"
The shipper sets their booking details in UI friendly way.
{
    "Origin: {
        "Name": "Luxe Patisserie Fairfield Heights",
        "StreetAddress":"253 The Boulevarde",
        "Building": "",
        "Suburb": "Fairfield Heights"
        "Postcode": "2165",
        "State": "New South Wales",
        "Country": "Australia"
        "Coordinates": {
            "Latitude": -35.3773497,
            "Longitude": 147.0619325
        }
    },
    "Origin: {
        "Name": "Woolworths Traralgon",
        "StreetAddress":"112 Hotham St",
        "Building": "",
        "Suburb": "Traralgon"
        "Postcode": "3844",
        "State": "Victoria",
        "Country": "Australia"
        "Coordinates": {
            "Latitude": -35.6623804,
            "Longitude": 147.0626879
        }
    },
    Pallets: [
        {
            "id": "ABC123", //Not Mandatory
            "Dimensions": [
                /*Dimensions for each in mm (integer)*/
                "Height": 1200,
                "Length": 1200,
                "Weight": 1200
            ],
            /*in Kilograms (integer)*/
            "Weight": 800,
        }
    ],
    "Budget": {
        /*Dollars - float*/
        "Minimum": 200.00,
        "Maximum": 350.00
    },
    "BookingDetails": {
        "Desctiption": "Frozen Deserts",
        /*Goods Type - String, from Dropdown List ["General", "Food - Ambient", "Food - Confectionery", "Food - Chilled", "Food - Frozen", "Dangerous Goods"], this list should be stored in a db table - allow the table to have Customer specific flag so that we can add additional later, this would be a feature we can add later*/
        "GoodsType": "Food - Frozen"
    },
    "Dates" :{
        "Collections": {
            "Minimum":"2025-10-20",
            "Requested": "2025-10-20",
            "Maximum": "2025-10-22"
        },
        "Delivery": {
            "Minimum":"2025-10-22",
            "Requested": "2025-10-22",
            "Maximum": "2025-10-24"
        }
    }
}

### Carrier Jobs Screen

The Job Search screen for carriers
The carrier should not be able to the budgets of the shipper.
The carrier would then "bid" on the booking request.

#### Carrier Rates

Carriers should have an area to set their default rates based on the rate zones.

#### Rate Zones

Areas will all be pre-defined based on Postcodes
Tables:
Zones - Columns: (PK)Id, ZoneName, Descriptions
Postcodes - Columns: (PK)Id, Postcode, (FK)ZoneId
Rates - Columns: (PK)Id, (FK)OriginZoneIds, (FK)DestinationZoneIds, (Multi Columns for) Dimenstions and Weight

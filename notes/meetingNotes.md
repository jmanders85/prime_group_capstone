# Notes on Initial meeting

Users:  Each organization will designate an "equipment manager" who interacts with the application.  Very often used on mobile devices (Sport Ngin's platform is responsive)  Members of the organization who want to reserve things would call or ask the equipment manager.  (Adam will follow up with which API permission level)
  - Stretch Goal:  Different permission levels where a user can directly interface with the app to reserve equipment

Organizations:  Medium to Big organizations (eg, Minnetonka Baseball League could have 2000 events), with lots of material to keep track of.  Very often volunteer run

Assets: Hockey pucks, nets, pads, etc.  Belong to one organization.  They will be reserved to Events.  At the very basic level, we will need to record an identifier and a name.  Other possible fields:
  * Maximum reservation length
  * Photo
  * Location

Events:  Games, practices

Reservations:  The business logic around reservations (buffer time, how quickly people need to return, how to group assets [bucket of pucks] etc) will be handled by the user, not by our app.
  - Stretch Goal:  Allow assets to be reserved irrespective of event, Allow some of this business logic to be optionally included by the app.

Specific Views:  See white board, Checking in/Checking out.  Checking in based on asset ID or by event.

Potential Issues:
- UX/UI/Design, they are happy to provide what guidance we need, Odell said he'd send out style guide -- we will also have a link to Sandbox
- UI for a date picker when an organization has 2000 events or more.
- KEEP IT SIMPLE
- API/OAuth is going to be the "hardest part"

Work Practices:  Adam is available for daily stand up any other time but 930.  There are desks available for us to work at.

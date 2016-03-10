# Equipment manager

by Nathan Briscoe, Gwen Paul, Natalie Koch, Liz Westberg & Joe Anderson

## Installation

After downloading, Run
```javascript
npm install
```

You will also need a .env file on the root with the following variables
```
CLIENT_ID
CLIENT_SECRET
DATABASE_URL
```

The Client ID and Client Secret are provided by the Sport Ngin Sandbox, Liz has the Heroku Postgres information.

The Passport OAuth is in what we're calling 'Development' mode, in that an access token is usually saved in the .env file.  For production, express-sessions will need to be implemented.

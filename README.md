# Equipment manager

by Nathan Briscoe, Gwen Paul, Natalie Koch, Liz Westberg & Joe Anderson

## Installation

You will need to have <a href="https://nodejs.org/en/">node.js</a> installed on your machine.

After downloading, open in your favorite IDE and Run
```javascript
npm install
```

You will also need a .env file on the root with the following variables
```
CLIENT_ID
CLIENT_SECRET
DATABASE_URL
```

The Client ID and Client Secret are provided by the Sport Ngin Sandbox, Liz has the Heroku Postgres information. To use our existing database, you will need a databaseurl.json file with the appropriate information. Liz shared that file out via email.

Once you're ready to go, Run
```javascript
npm start
```

Head to localhost:3000 on your browser and log in using your Sport Ngin account.

The Passport OAuth is in what we're calling 'Development' mode, in that an access token is usually saved in the .env file.  For production, express-sessions will need to be implemented.

Additionally, images 'uploaded' for items are not hosted in the database. Only their path on your local machine.

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
require('dotenv').config()
const port = 5000

console.log(process.env.DB_PASS);

const admin = require('firebase-admin');

const app = express();
// middlewire connection
app.use(cors());
app.use(bodyParser.json())


var serviceAccount = require("./configs/burj-al-arab-f3a97-firebase-adminsdk-hvx9k-6c30fa61b2.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL : process.env.FIRE_DB
});






const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0fkav.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  // perform actions on the collection object
  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
    console.log(newBooking);
  })

  app.get('/bookings', (req, res) => {
    // idToken comes from the client app
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log({ idToken });
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if (tokenEmail == req.query.email) {
            bookings.find({ email: req.query.email })
              .toArray((err, documents) => {
                res.status(200).send(documents);
              })

          }
          else{
            res.status(401).send('un authorized access')
          }
        })
        .catch((error) => {
          // Handle error
          res.status(401).send('un authorized access')
        });

    }
    else{
      res.status(401).send('un authorized access')
    }

  })


});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)
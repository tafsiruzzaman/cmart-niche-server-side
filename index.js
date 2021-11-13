const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.whaok.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("Cmart");
      const carCollection = database.collection("all-cars");
      const allBookings = database.collection("bookings");
      const usersCollection = database.collection('users');
      const reviewCollection = database.collection('reviews')


      // GET API
      app.get('/all-cars', async (req, res) => {
        const cursor = carCollection.find({});
        const cars = await cursor.toArray();
        res.send(cars);
      })

      app.get('/homecars', async (req, res) => {
        const cursor = carCollection.find({});
        const result = await cursor.toArray();
        const cars = result.slice(Math.max(result.length -3, 0))
        res.send(cars);
      })

      app.get('/all-cars/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const carInfo = await carCollection.findOne(query);
        res.send(carInfo);
      })

      app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
          isAdmin = true;
        }
        res.json({ admin: isAdmin });
      })

      app.get('/all-bookings/:email', async (req, res) => {
        console.log("hit the api")
        const email = req.params.email;
        const query = {email: email};
        const cursor = allBookings.find(query);
        const usersBookings = await cursor.toArray();
        res.send(usersBookings);
      })

      // Post API

      app.post('/allBookings', async (req, res) => {
        const newBooking = req.body;
        const result = await allBookings.insertOne(newBooking);
        res.json(result);
      });

      app.post('/reviews', async (req, res) => {
        console.log('hit the api')
        const newReview = req.body;
        const result = await reviewCollection.insertOne(newReview);
        res.json(result);
      });

      app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      });

      //UPDATE API
    //   app.put('/allBookings/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const bookingUpdate = req.body;
    //     const filter = { _id: ObjectId(id) };
    //     const options = { upsert: true };
    //     const updateDoc = {
    //         $set: {
    //             status: bookingUpdate.status
    //         },
    //     };
    //     const result = await allBookings.updateOne(filter, updateDoc, options)
    //     console.log('updating', id)
    //     res.json(result)
    //   })

      app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
      });

      app.put('/users/admin', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      })

      // Delete API
      app.delete('/all-bookings/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await allBookings.deleteOne(query);
        res.json(result);
      })
     
    } finally {
    //   await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
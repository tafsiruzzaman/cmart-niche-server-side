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

      app.get('/all-bookings', async (req, res) => {
        const cursor = allBookings.find({});
        const bookings = await cursor.toArray();
        res.send(bookings);
      })

      app.get('/reviews', async (req, res) => {
        const cursor = reviewCollection.find({});
        const reviews = await cursor.toArray();
        res.send(reviews);
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
        const email = req.params.email;
        const query = {email: email};
        const cursor = allBookings.find(query);
        const usersBookings = await cursor.toArray();
        res.send(usersBookings);
      })

      // Post API

      app.post('/all-bookings', async (req, res) => {
        const newBooking = req.body;
        const result = await allBookings.insertOne(newBooking);
        res.json(result);
      });
      app.post('/all-cars', async (req, res) => {
        const newCar = req.body;
        const result = await carCollection.insertOne(newCar);
        res.json(result);
      });

      app.post('/reviews', async (req, res) => {
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
      app.put('/all-bookings/:id', async (req, res) => {
        const id = req.params.id;
        const bookingUpdate = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
              status: bookingUpdate.status
            },
        };
        const result = await allBookings.updateOne(filter, updateDoc, options);
        res.json(result)
      })

      app.put('/all-cars/:id', async (req, res) => {
        const id = req.params.id;
        const carUpdate = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            colour: carUpdate.colour,
            description: carUpdate.description,
            fuelType: carUpdate.fuelType,
            img: carUpdate.img,
            location: carUpdate.location,
            manufacturerYear: carUpdate.manufacturerYear,
            mileage: carUpdate.mileage,
            mode: carUpdate.mode,
            name: carUpdate.name,
            price: carUpdate.price,
            ratting: carUpdate.ratting,
            review: carUpdate.review,
            type: carUpdate.type
          },
        };
        const result = await carCollection.updateOne(filter, updateDoc, options);
        res.json(result)
      })

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

      app.delete('/all-cars/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await carCollection.deleteOne(query);
        res.json(result);
      })
     
    } finally {
    //   await client.close(); 
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World! ')
})
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
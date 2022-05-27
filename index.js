const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;



// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1iq0k3h.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Async function start from here
async function run() {
    try {
        await client.connect();
        const productCollection = client.db('modern_parts').collection('products');
        const bookingCollection = client.db('modern_parts').collection('bookings');
        const userCollection = client.db('modern_parts').collection('users');
        // get products data to back end
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        });
        // get user information 
        app.get('/user', async (res, req) => {
            const users = await userCollection.find().toArray();
            res.send(users)
        })
        // users collection API setUp
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ result, token })
        })
        // booking API data load in here
        app.get('/booking', async (req, res) => {
            const booking = req.query.booking;
            const query = { booking: booking };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result)
        });
    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Welcome to my Projects')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Port = 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const corsOptions = {
    origin: ['http://localhost:5173'],
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t87ip2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const menuCollection = client.db("dream-foods").collection("menu");
        const cartCollection = client.db("dream-foods").collection("cart");
        const reviewCollection = client.db("dream-foods").collection("reviews");
        const orderAddressCollection = client.db("dream-foods").collection("orderAddress");
        const paymentCollection = client.db("dream-foods").collection("payments");

        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result);
        });

        app.post('/cart', async (req, res) => {
            const result = await cartCollection.insertOne(req.body);
            res.send(result);
        });

        app.get('/cart', async (req, res) => {
            const query = { email: req.query.email };
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        });

        app.delete('/cart/:id', async (req, res) => {
            const result = await cartCollection.deleteOne({ _id: new ObjectId(req.params.id) });
            res.send(result);
        });

        app.get('/cart/:id', async (req, res) => {
            const result = await cartCollection.findOne({ _id: new ObjectId(req.params.id) });
            res.send(result);
        });

        app.post('/reviews', async (req, res) => {
            const result = await reviewCollection.insertOne(req.body);
            res.send(result);
        });

        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);
        });

        app.post('/orderAddress', async (req, res) => {
            const result = await orderAddressCollection.insertOne(req.body);
            res.send(result);
        });

        app.get('/orderAddress', async (req, res) => {
            const result = await orderAddressCollection.find().toArray();
            res.send(result);
        });

        app.post('/create-payment-intent', async (req, res) => {
            try {
                const { price } = req.body;
                const amount = parseInt(price * 100);
                if (isNaN(amount) || amount <= 0) {
                    return res.status(400).send({ error: 'Invalid amount' });
                }
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amount,
                    currency: 'usd',
                    payment_method_types: ['card']
                });
                res.send({
                    clientSecret: paymentIntent.client_secret
                });
            } catch (error) {
                console.error('Error creating payment intent:', error);
                res.status(500).send({ error: error.message });
            }
        });

        app.post('/payments', async(req,res)=>{
            const payment = req.body;
            const paymentResult = await paymentCollection.insertOne(payment)
            const query ={_id: {
                $in : payment.cartId.map(id => new ObjectId(id))
            }};

            const deleteResult = await cartCollection.deleteMany(query)
            res.send({paymentResult, deleteResult})
        })



    } catch (err) {
        console.error(err);
    }
}

run().catch(console.dir);

app.get("/", async (req, res) => {
    res.send({ message: "Welcome to our server" });
});

app.listen(Port, () => {
    console.log(`Server is running at http://localhost:${Port}`);
});

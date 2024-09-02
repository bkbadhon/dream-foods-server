const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config()
const Port = 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

const corsOptions = {
    origin: ['http://localhost:5173'],
    credentials: true, 
  };

app.use(express.json());
app.use(cors(corsOptions));



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t87ip2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const menuCollection = client.db("dream-foods").collection("menu");


    app.get('/menu', async(req,res)=>{
        const data = menuCollection.find()
        const result = await data.toArray()
        res.send(result)
    })

 


    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", async (req, res) => {
    res.send({ message: "Welcome to our server" });
});

app.listen(Port, () => {
    console.log(`Server is running at ${Port}`);
});
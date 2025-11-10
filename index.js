const express = require('express')
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;


// middleware
app.use(cors());
app.use(express.json());



// password
// ypl0Iu2wxL5vQao8
const uri = "mongodb+srv://localdbUser:ypl0Iu2wxL5vQao8@cluster0.vvoht34.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get("/", (req, res) =>{
  res.send("Smart server is running")
})

async function run() {
  try {
    
    await client.connect();

    const db = client.db("review_db")
    const reviewCollection = db.collection("reviews")


     app.post("/reviews", async(req,res) =>{
        const newReviews =req.body;
        const result = await reviewCollection.insertOne(newReviews);
        res.send(result);
    })

     app.delete("/reviews/:id", async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await reviewCollection.deleteOne(query)
      res.send(result)
    })
     await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
    finally{


    }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`local food lover server is running on port ${port}`)
})

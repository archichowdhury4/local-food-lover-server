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
    const usersCollection = db.collection("users")
    const favoriteCollection = db.collection("favorites");
    // reviewCollection 
     app.get("/reviews", async(req,res) =>{
      const cursor = reviewCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
// Insert
     app.post("/reviews", async(req,res) =>{
        const newReviews =req.body;
        newReviews.date = new Date();
        const result = await reviewCollection.insertOne(newReviews);
        res.send(result);
    })
    // Sort by date descending
    app.get("/reviews", async (req, res) => {
  const cursor = reviewCollection.find().sort({ date: -1 }); 
  const result = await cursor.toArray();
  res.send(result);
});



// Get Top 6 Reviews (sorted by rating)
app.get("/top-reviews", async (req, res) => {
  const cursor = reviewCollection.find().sort({ rating: -1 }).limit(6);
  const result = await cursor.toArray();
  res.send(result);
});


// for single review details
app.get("/reviews/:id", async (req, res) => {
  const id = req.params.id;
  const review = await reviewCollection.findOne({ _id: new ObjectId(id) });
  res.send(review);
});


// delete
     app.delete("/reviews/:id", async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await reviewCollection.deleteOne(query)
      res.send(result)
    })
// my reviews
app.get("/my-reviews/:email", async (req, res) => {
      const email = req.params.email;
      const reviews = await reviewCollection.find({ email }).sort({ date: -1 }).toArray();
      res.send(reviews);
    });

// Update review
app.patch("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body; 
    const result = await reviewCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Update failed" });
  }
});

  // Top foodies
  app.get("/top-foodies", async (req, res) => {
    const users = await usersCollection.find().toArray();
    const top = users.map(u => ({
      name: u.name,
      photo: u.photo || "",
      reviewsCount: u.reviews?.length || 0
    }))
    .sort((a,b)=>b.reviewsCount - a.reviewsCount)
    .slice(0,10);
    res.send(top);
  });




    // usersCollection
   app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = newUser.email;

      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }

      const result = await usersCollection.insertOne(newUser);
      console.log("New user inserted:", newUser);
      res.send(result);
    });

    // Get all users
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });
// Favorites API
app.get("/favorites", async (req, res) => {
  const email = req.query.email;
  const cursor = await favoriteCollection.find({ email }).toArray();
  res.send(cursor);
});

// POST: add favorite
app.post("/favorites", async (req, res) => {
  const favorite = req.body;
  const existing = await favoriteCollection.findOne({
    email: favorite.email,
    reviewId: favorite.reviewId,
  });
  if (existing) return res.status(400).json({ message: "Already added to favorites" });
  const result = await favoriteCollection.insertOne(favorite);
  res.send(result);
});

// GET: get user favorites
app.get("/favorites/:email", async (req, res) => {
  const email = req.params.email;
  const favorites = await favoriteCollection.find({ email }).toArray();
  res.send(favorites);
});

// DELETE: remove favorite
app.delete("/favorites/:id", async (req, res) => {
  const id = req.params.id;
  const result = await favoriteCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});



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

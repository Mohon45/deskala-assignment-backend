const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const { query } = require("express");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m0coh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("deskala");
    const candidatesCollection = database.collection("candidates");

    // get candidates
    app.get("/candidates", async (req, res) => {
      const query = {};
      const cursor = candidatesCollection.find(query);
      const candidates = await cursor.toArray();
      res.send(candidates);
    });

    // create a new candidate
    app.post("/candidates/create", async (req, res) => {
      const newCandidate = req.body;
      console.log("adding new candidates", newCandidate);
      const result = await candidatesCollection.insertOne(newCandidate);
      res.send(result);
    });

    // fined a single candidate
    app.get("/candidates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await candidatesCollection.findOne(query);
      res.send(result);
    });

    // update a candidate

    app.put("/candidates/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCandidates = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedCandidates.name,
          address: updatedCandidates.address,
          birthDate: updatedCandidates.birthDate,
          state: updatedCandidates.state,
          age: updatedCandidates.age,
          code: updatedCandidates.code,
        },
      };
      const result = await candidatesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    /// delete candidate
    app.delete("/candidate/delete/:id", async (req, res) => {
      const result = await candidatesCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Deskala");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});

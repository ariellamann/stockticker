const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://ariellamann:abc@cluster0.uzio5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("Stock");
    const collection = db.collection("PublicCompanies");
    const test = await collection.find({}).limit(1).toArray();
    console.log("Sample Data:", test);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.close();
  }
}

testConnection();

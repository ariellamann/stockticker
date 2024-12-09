const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;
//const uri = "mongodb+srv://ariellamann:abc@cluster0.uzio5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/Stock";


app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html')); // Serve the home.html file from the same directory
});

// Process Page Route (Serves Data as JSON)
app.get('/process', async (req, res) => {
    const { query, searchType } = req.query;

    try {
        // Connect
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db("Stock");
        const collection = db.collection("PublicCompanies");

        let filter = {};
        if (searchType === 'ticker') {
            filter = { stockTicker: query };
        } else if (searchType === 'name') {
            filter = { name: query };
        }

        const results = await collection.find(filter).toArray();
        res.json(results);

        await client.close(); // Close 
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred while processing your request.");
    }
});

// Start the Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

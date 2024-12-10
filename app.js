const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from "public"

// MongoDB Connection
const uri = process.env.MONGO_URI || "mongodb+srv://ariellamann:abc@cluster0.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let db; // Store the database connection

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db('Stock');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
    }
}
connectToDatabase();

// Default Route (Serve Homepage)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Search Endpoint
app.get('/search', async (req, res) => {
    const query = req.query.query;
    const type = req.query.type;

    if (!query || !type) {
        return res.status(400).send({ error: 'Invalid search query' });
    }

    const collection = db.collection('PublicCompanies');
    const searchQuery = type === 'ticker'
        ? { ticker: query.toUpperCase() }
        : { company: { $regex: query, $options: 'i' } };

    try {
        const results = await collection.find(searchQuery).toArray();
        res.send(results);
    } catch (error) {
        console.error('Error querying the database:', error);
        res.status(500).send({ error: 'Error querying the database' });
    }
});

// Start the Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
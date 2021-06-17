  
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');


const url = process.env.NODE_ENV;
const app = express();
const port = 3000;
const dbName = "movies-data";
const collectionName = "movies";
let client = "";

app.use(bodyParser.json());


// used to list the movies in the database
app.get('/movie/list', async (req, res) => {
    const collection = client.db(dbName).collection(collectionName);
    const response = await collection.find().toArray();
    res.send(JSON.stringify(response));
})

//list by grouping actors with no of movies and total runtime
app.get('/movie/actor/analysis', async (req, res) => {
    const collection = client.db(dbName).collection(collectionName);
    const response = await collection.aggregate([
        {
           $group:{
              _id:"$actor",
              totalRunningTime:{"$sum":"$length"},
              totalMoviesOfActor:{"$sum":1}
           }
        }]).toArray();
    res.send(response);
})

//list group by year with no of movies and total runtime
app.get('/movie/year/analysis', async (req, res) => {
    const collection = client.db(dbName).collection(collectionName);
    const response = await collection.aggregate([
        {
           $group:{
              _id:"$year",
              totalRunningTime:{"$sum":"$length"},
              totalMoviesInYear:{"$sum":1}
           }
        }]).toArray();
    res.send(response);
})

// create movies with required feilds
app.post('/movie/create', async (req, res) => {
    const movieObject=req.body;
    if(!movieObject.name || !movieObject.genre   || !movieObject.actor)
    {
        return res.status(400).send("Must send required feilds[name,year,length,actor]");
    }
    const { name,actor,year} = movieObject;
    const collection = client.db(dbName).collection(collectionName);
    const response = await collection.insertOne({ name: name, year: year,actor:actor});
    res.send(response.result);
})

app.put('/update/:name', async (req, res) => {
    const collection = client.db(dbName).collection(collectionName);
    const {name}=req.params;

    const response = await collection.updateOne(
        {name:name},
        {
            $set: req.body
        }
    );

    res.send(response.result);
})

app.delete('/delete/', async (req, res) => {
    const collection = client.db(dbName).collection(collectionName);
    const movieObject=req.body;
    if(!movieObject.name)
    {
        return res.status(400).send("Must send required feilds[name,year,length,actor]");
    }
    const { name} = movieObject;
   // const {name}=req.params;

    const response = await collection.deleteOne(
        {name:name}
    );
        console.log(response.result)
    res.send(response.result);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

const connectToDatabase = async () => {
    console.log("Connected to the database");
    client = await MongoClient.connect(url,{ useUnifiedTopology: true });
}

connectToDatabase();
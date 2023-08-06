const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

//middle wares
app.use(cors());
app.use(express.json());


const objectID = require('mongodb').ObjectId
//mongoDB user and password
console.log(process.env.DB_USER)
console.log(process.env.DB_Password)

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hupk8pl.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const bookCollection = client.db('myBooks').collection('bookList');
        // const reviewCollection = client.db('myBooks').collection('review');

        app.get('/books', async (req, res) => {
            const query = {};
            const cursor = bookCollection.find(query);
            const books = await cursor.toArray()            //toArray
            res.send(books)
        })

        app.get('/books/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: objectID(id) }
            const books = await bookCollection.findOne(query)            //toArray
            res.send(books)
        })


        app.post('/books', async (req, res) => {
            const book = req.body;
            const result = await bookCollection.insertOne(book)
            res.send(result);
        })

        app.delete('/books/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: objectID(id) }
            const result = await bookCollection.deleteOne(query);
            res.send(result);
        })

        // review
        app.post('/comment/:id', async (req, res) => {
            const bookId = req.params.id;
            const comment = req.body.comment;

            console.log(bookId);
            console.log(comment);

            const result = await bookCollection.updateOne(
                { _id: objectID(bookId) } ,
                { $push: { comments: comment } }
            );

            console.log(result);

            // if (result.modifiedCount !== 1) {
            //     console.error('book not found or comment not added');
            //     res.json({ error: 'book not found or comment not added' });
            //     return;
            // }

            console.log('Comment added successfully');
            res.json({ message: 'Comment added successfully' });
        });

        app.get('/comment/:id', async (req, res) => {
            const bookId = req.params.id;

            const result = await bookCollection.findOne(
                { _id: objectID(bookId) }  ,
                { projection: { _id: 0, comments: 1 } }
            );

            if (result) {
                res.json(result);
            } else {
                res.status(404).json({ error: 'Book not found' });
            }
        });

        //User
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;

            const result = await userCollection.findOne({ email });

            if (result?.email) {
                return res.send({ status: true, data: result });
            }

            res.send({ status: false });
        });

    }
    finally {
    }
}
run().catch(err => console.error())
//api read
app.get('/', (req, res) => {
    res.send('Book server is running Broooooooooooooooooooooooooooooo')
})

//api port
app.listen(port, () => {
    console.log(`Book server is running at the ${5000}`)
})

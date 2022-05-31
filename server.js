const express = require('express') //loads the module
const app = express() //executes the module, starts express
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db, collection;

const url = 'mongodb+srv://GabrielleHoyte:Password0@cluster0.ioxl7.mongodb.net/?retryWrites=true&w=majority'
const dbName = "demo";

app.listen(3000, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        collection = db.collection('messages')
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true})) //middle-ware setup
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => { //requesting from the server to render the index.ejs
  collection.find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {messages: result}) //returns whatever messages are already stored in the db
  })
})

app.post('/messages', (req, res) => { //set up a handler to handle post requests to /messages
  collection.insertOne({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

app.put('/messages', (req, res) => { //handler to update the posts in /messages
  collection.findOneAndUpdate({name: req.body.name, msg: req.body.msg},{
    $set: {
      thumbUp:req.body.thumbUp + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result) //the response to the client
  })
})

app.put('/dislike', (req, res) => { //different uri to run the thumb down function 
  collection
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp - 1 //only other difference is the '-' as we are referencing the same thumbs up number
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  let message = {message: 'Message deleted!'}
  collection.findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send(message)
      
  })
})

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var mongoose = require('mongoose');

const app = express();
const port = 3000;
const url = 'mongodb://localhost:27017/inventory';
let db;

app.use(bodyParser.json());
app.use(cors());

db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
    console.log('were connected!');
});

const orderSchema = new mongoose.Schema({
    companyName: String,
    partNumber: String,
    quantityOrder: String,
    quantityMade: String,
    madeDate: String,
    quantityScrap: String,
    quantityShipped: String,
    shippedDate: String,
    stock: String,
    location : String
});

const Order = mongoose.model('Order', orderSchema);


const User = mongoose.model('User', {
    name: String,
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

app.post('/api/order', async (req, res) => {
    const order = new Order(req.body.orders);
    console.log(order);
    order.save();

    res.sendStatus(200)
})

app.post('/api/updateOrder', async (req, res) => {
    Order.findById(req.body.orders._id, function(err, p) {
        if (!p)
          return next(new Error('Could not load Document'));
        else {
          // do your updates here
          p.companyName = req.body.orders.companyName;
          p.partNumber = req.body.orders.partNumber;
          p.quantityOrder = req.body.orders.quantityOrder;
          p.quantityMade = req.body.orders.quantityMade;
          p.madeDate = req.body.orders.madeDate;
          p.quantityScrap = req.body.orders.quantityScrap;
          p.quantityShipped = req.body.orders.quantityShipped;
          p.stock = req.body.orders.stock;
          p.location = req.body.orders.location;
      
          p.save(function(err) {
            if (err)
              console.log('error')
            else
              console.log('success');
              res.json('success')
          });
        }
    });
})

app.get('/api/getOrders', async (req, res) => {
    const docs = await Order.find();
    if(!docs) {
        return res.json({error: 'Error'});
    } else {
        res.json(docs);
    }
})

app.post('/api/deleteOrder', async (req, res) => {
    Order.findById(req.body.orders._id, function(err, p) {
        if (!p)
          return next(new Error('Could not load Document'));
        else {
          p.remove(function(err) {
            if (err)
              console.log('error')
            else
              console.log('success')
          });
        }
    });
})

app.get('/api/user/:name?', async (req, res) => {
    const name = req.params.name;

    const aggregate = await User.aggregate([
        // { $match : { name } },
        { 
            $project: { 
                messages: 1, name: 1, isGold: {
                    $gte: [{$size: "$messages"}, 5]
                }
            }
        }
    ]);

    // await User.populate(aggregate, {path: 'messages'});

    return res.json(aggregate);
    // return res.json(await User.findOne({name}).populate('messages'));
})


mongoose.connect(url)
app.listen(port, () => console.log('App running on port ', port));
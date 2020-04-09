const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const app = express();
const getStockData = require('./controllers/getStockData');
const mongoose = require('mongoose');
const mongodb = require('mongodb');

app.use(cors());
app.use(helmet.contentSecurityPolicy({ directives: {defaultSrc : ["'self'"], scriptSrc :["'self","trusted-cdn.com"]}}));
app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static(process.cwd() + '/public'));
app.get('/', (req,res) => res.sendFile(process.cwd() + '/views/index.html'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/api/stock-prices', getStockData)


app.use(function (req, res, next) {
  res.status(404).send('404 - Not Found!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started on 3000');
});
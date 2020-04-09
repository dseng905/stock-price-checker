const mongoose = require('mongoose');
const stock = require('../models/stock.js');
const fetch = require('node-fetch');


//Get latest stock data from a stock price API using fetch
async function getStock(ticker) {
  const stockURL = 'https://repeated-alpaca.glitch.me/v1/stock/' + ticker +'/quote';
  let res = await fetch(stockURL);
  let stockData = await res.json();
  //console.log(stockData);
  return stockData;
}

//Check if stock exists in database
//If not, create an entry for the stock
async function findAndUpdateStock(ticker,like) {
  const latestStock = await getStock(ticker);
  let stockData = await stock.findOne({stock:ticker}).exec();
  if(!stockData) { //If stock does not exist in the database
    const newStock = {
      stock : ticker,
      price : latestStock.latestPrice,
      likes : like == 'true' ? 1 : 0
    };
    await stock.create(newStock);
    stockData = newStock;
  }
  else {
    //If stock entry exists, update stock entry with latest price and likes
    stockData.price = latestStock.latestPrice;
    if(like == 'true') stockData.likes++;
    await stockData.save();
  }

  //console.log(stockData);
  return stockData;
}

module.exports = async (req,res) => {
  if(typeof req.query.stock == 'string') {
    //Retrive stock data from database and update it
    const newStockData = await findAndUpdateStock(req.query.stock, req.query.like);
      res.json({
        stockData : {
          stock : newStockData.stock,
          price : newStockData.price,
          likes : newStockData.likes
        },
      })    
  }
  else if(typeof req.query.stock == 'object' && req.query.stock.length == 2) {
    //Query contains two stocks
    let stockData1 = {};
    let stockData2 = {};

    //Check if there are multiple likes
    if(typeof req.query.like == 'object') { //If more than one stock gets a like.
      stockData1 = await findAndUpdateStock(req.query.stock[0],req.query.like[0]);
      stockData2 = await findAndUpdateStock(req.query.stock[1],req.query.like[1]);
    }
    else {
      stockData1 = await findAndUpdateStock(req.query.stock[0],req.query.like);
      stockData2 = await findAndUpdateStock(req.query.stock[1], 'false');
    }

    //Use likes to compute rel_likes (difference between likes)
    const like1 = stockData1.likes;
    const like2 = stockData2.likes;
    res.json({
      stockData : [
        {
          stock: stockData1.stock,
          price: stockData1.price,
          rel_likes: like1-like2
        },
        {
          stock: stockData2.stock,
          price: stockData2.price,
          rel_likes: like2-like1
        }
      ]
    })
  }
  else {
    res.send("Invalid query.")
  }
}
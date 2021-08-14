const express = require("express");
const app = express();
const axios = require("axios");
require("dotenv").config();
app.use(express.json());
const cors = require("cors");
app.use(cors());

let cache = {};
const TIME_TO_LIVE = 3000; // 5 minutes

app.use(express.static("public"));

app.get("/apiproxy", async (req, res) => {
  let queryKeys = Object.keys(req.query); // gets an array of all of the keys
  queryKeys.shift(); // removes url from that array
  let url = req.query.url;
  if (queryKeys.length > 0) {
    queryKeys.forEach((key) => {
      url = url + `&${key}=${req.query[key]}`;
    });
  }
  if (isInCache(url)) {
    console.log("Responding from Cache");
    res.json(retriveFromCache(url));
  } else {
    console.log("Getting new data");
    let response = await axios.get(url);

    let data = {
      data: response.data,
      expires: Date.now() + TIME_TO_LIVE,
      ip: req.ip,
    };
    storeInCache(url, data);

    res.json(response.data);
  }
});

const port = process.env.PORT || 6001;
app.listen(port, () => {
  console.log("Back end is alive! + listening on " + port);
});

function isInCache(url) {
  // Checks to see if the url is in the cache, and returns true or false
  return cache[url] && Date.now() < cache[url].expires;
}

function retriveFromCache(url) {
  // Using URL as key return data in the following format
  // {
  //   data: {data from request},
  //   expires: times now + 5mins,
  //   ip: users ip address
  // }
  return cache[url].data;
}

function storeInCache(url, data) {
  // using the URL as the key, stores the data which is formatted as
  // {
  //   data: {data from request},
  //   expires: times now + 5mins,
  //   ip: users ip address
  // }
  // In future, will store our data in DB
  cache[url] = data;
}

function getUsersCache(ip) {
  let output = [];
  // iterate over the cache and if IP matches, add that to output
  return output;
}

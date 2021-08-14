const express = require("express");
const app = express();
const axios = require("axios");
require("dotenv").config();
app.use(express.json());
const cors = require("cors");
app.use(cors());

let cache = {};
const TIME_TO_LIVE = 300000; // 5 minutes

app.use(express.static("public"));

app.get("/apiproxy", async (req, res) => {
  if (!req.query.url) {
    // Serve Static HTML
    console.log("No URL");
  }
  let queryKeys = Object.keys(req.query); // gets an array of all of the keys
  queryKeys.shift(); // removes url from that array
  let url = req.query.url;
  console.log(url);
  if (queryKeys.length > 0) {
    queryKeys.forEach((key) => {
      url = url + `&${key}=${req.query[key]}`;
    });
  }
  console.log(url);

  if (cache[url] && Date.now() < cache[url].expires) {
    res.json(cache[url].data);
  } else {
    let response = await axios.get(url);
    cache[url] = {
      data: response.data,
      expires: Date.now() + TIME_TO_LIVE,
    };
    res.json(response.data);
  }
});

const port = process.env.PORT || 6001;
app.listen(port, () => {
  console.log("Back end is alive! + listening on " + port);
});

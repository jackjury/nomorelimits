const express = require("express");
const app = express();
const axios = require("axios");
require("dotenv").config();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mysql = require("mysql");
require("dotenv").config();

const connection = {};
connection.mysql = mysql.createConnection({
  database: process.env.DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST, // ?
  port: process.env.DB_PORT,
});

connection.mysql.connect();

function makeAsync(query) {
  return new Promise(function (resolve, reject) {
    connection.mysql.query(query, (err, results) => {
      if (err) reject();
      //else resolve
      resolve(results);
    });
  });
}

let cache = {};
const TIME_TO_LIVE = 15000; // 5 minutes

app.use(express.static("public"));

app.get("/proxy", async (req, res) => {
  let queryKeys = Object.keys(req.query); // gets an array of all of the keys
  queryKeys.shift(); // removes url from that array
  let url = req.query.url;
  if (queryKeys.length > 0) {
    queryKeys.forEach((key) => {
      url = url + `&${key}=${req.query[key]}`;
    });
  }

  let isInCacheUrl = await isInCache(url);

  if (isInCacheUrl) {
    console.log("Responding from Cache");
    let response = await retriveFromCache(url);
    res.json(response);
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

const port = process.env.PORT || 6001; // add in process.env later
app.listen(port, () => {
  console.log("Back end is alive! + listening on " + port);
});

async function isInCache(url) {
  // Checks to see if the url is in the cache, and returns true or false
  const query = `SELECT url, expires
                  FROM apiTable
                  WHERE url LIKE "${url}" 
                  ORDER BY expires DESC 
                  LIMIT 1`;

  const results = await makeAsync(query);

  if (results.length > 0 && Date.now() < results[0].expires) {
    console.log("true, in cache");
    return true;
  }
  console.log("false, not in cache or expired");
  return false;
}

async function retriveFromCache(url) {
  // Using URL as key return data in the following format
  // {
  //   data: {data from request},
  //   expires: times now + 5mins,
  //   ip: users ip address
  // }
  const query = `SELECT data, expires, ip_address
                  FROM apiTable
                  WHERE url LIKE "${url}"
                  ORDER BY expires DESC 
                  LIMIT 1`;

  const results = await makeAsync(query);

  if (results.length > 0) {
    let output = {
      data: JSON.parse(results[0].data),
      expires: results[0].expires,
      ip: results[0].ip_address,
    };

    console.log(output);
    return output.data;
  }
}

function storeInCache(url, data) {
  // using the URL as the key, stores the data which is formatted as
  // {
  //   data: {data from request},
  //   expires: times now + 5mins,
  //   ip: users ip address
  // }
  // In future, will store our data in DB

  const query = `INSERT INTO 
                   apiTable (url, data, expires, ip_address) 
                   VALUES ("${url}", ?,
                    "${data.expires}", "${data.ip}")`;

  const values = [JSON.stringify(data.data)];

  connection.mysql.query(query, values, (error, results) => {});
}

// worry about later
// function getUsersCache(ip) {
//   let output = [];

//   app.get("/apiproxy", (request, response) => {
//     const query = `SELECT ip_address
//                   FROM apiTable
//                   WHERE ip_address LIKE "${data.ip}"`;

//     console.log(query);

//     connection.mysql.query(query, (error, results) => {
//       if (results.count === 1) {
//         return output;
//       }
//       //query then what happens after execution
//       console.log(("results:", JSON.stringify(results)), "error:", error);
//     });
//   });

//   // iterate over the cache and if IP matches, add that to output
// }

var express = require("express");
var router = express.Router();
var request = require("request");
var async = require("async");

var data = {};

function registerWebhook(req, res, next) {
  var domain = req.body.domain;
  var token = req.body.accessToken;
  var url = req.headers.referer + "webhook";
  var options = { 
    uri: "http://api.connector.mbed.org/" + domain + "/notification/callback",
    method: "PUT",
    headers: { Authorization: "Bearer " + token },
    json: { url: url }
  };

  request(options, function (error, response, body) {
    if (error) {
      return res.sendStatus(400);
    } else if (response.statusCode !== 204) {
      return res.sendStatus(400);
    } else {
      next();
    }
  });
}

function registerPreSubscription(req, res, next) {
  var domain = req.body.domain;
  var token = req.body.accessToken;
  var options = { 
    uri: "http://api.connector.mbed.org/" + domain + "/subscriptions",
    method: "PUT",
    headers: { Authorization: "Bearer " + token },
    json: [{ "resource-path": ["/Test/0/D"] }]
  };

  request(options, function (error, response, body) {
    if (error) {
      return res.sendStatus(400);
    } else if (response.statusCode !== 202 && response.statusCode !== 204) {
      return res.sendStatus(400);
    } else {
      next();
    }
  });  
}

function getEndpoints(req, res, next) {
  var domain = req.body.domain;
  var token = req.body.accessToken;
  var options = { 
    uri: "http://api.connector.mbed.org/" + domain + "/endpoints",
    headers: { Authorization: "Bearer " + token }
  };

  request(options, function (error, response, body) {
    if (error) {
      return res.sendStatus(400);
    } else if (response.statusCode !== 200) {
      return res.sendStatus(400);
    } else {
      req.endpoints = JSON.parse(body);
      next();
    }
  });
}

router.get("/", function(req, res, next) {
  return res.render("index", { title: "Device List" });
});

router.post("/submit", registerWebhook, registerPreSubscription, getEndpoints, function(req, res, next) {  
  return res.render("dashboard", { endpoints: req.endpoints });
});

router.put("/webhook", function(req, res, next) {
  console.log(req.body);
  if (req.body.notifications) {
    data = req.body;
  }
  res.sendStatus(200);
});

router.get("/update", function (req, res, next) {
  return res.send(data);
});

module.exports = router;

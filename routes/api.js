var express = require('express');
var router = express.Router();
var lastFM = require('../models/lastFM-schema');
var goodreads = require('../models/goodreads-schema');

router.get('/lastFM', function (req, res, next) {
    lastFM.findOne({}, {}, { sort: { '_id' : -1 } }, function(err, data) {
        if (err) return next(err);
        res.json(data);
    });      
});

router.get('/goodreads', function (req, res, next) {
    goodreads.findOne({}, {}, { sort: { '_id' : -1 } }, function(err, data) {
        if (err) return next(err);
        res.json(data);
    });      
});

module.exports = router;

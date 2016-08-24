var request = require('request');
var Q = require('q');
var moment = require('moment');

var secrets = require('../config/secrets');
var lastFMSchema = require('../models/last-fm-schema');
var apiKey = secrets.lastFmKey;

exports.save = function() {
	topArtists().then(recentTracks).then(save).catch(function(err){
		console.log("Caught lastFM error", err);
	});
};

function topArtists() {
	var defer = Q.defer();
    var url = "http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=waterland15&limit=15&page=1&api_key=" +
        apiKey + "&format=json&period=6month";

	var temp = [];
	request(url, function (error, response, body) {
		if (error || response.statusCode !== 200) {
			defer.reject("Get LastFM top artists error");
		} else {
			try {
				var data = JSON.parse(body);
				if(!data || !data.topartists || !data.topartists.artist || !data.topartists.artist.length || !data.topartists['@attr']) {
                    return defer.reject("Could not parse top artist data");
                }
				var artistData = data.topartists.artist;
                var artistCount = data.topartists['@attr'].total;

				for (var i=0; i < artistData.length; i++){
					temp.push({
						artist: artistData[i].name,
						img: artistData[i].image[2]['#text'] // IMAGE SIZES: 0 = S, 1 = M, 2 = L, 3 = XL, 4 = Mega
					});
				}
                var res = {
                    artistCount: artistCount,
                    topArtists: temp
                };
				defer.resolve(res);
			} catch(err){
				defer.reject(err);
			}
		}
	});
	return defer.promise;
}

function recentTracks(promiseData) {
	var defer = Q.defer();
	var fromDate = moment().subtract(90, 'days').unix();
	var toDate = moment().unix();
    var url = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=waterland15&limit=1&page=1&api_key=" +
        apiKey + "&format=json&from=" + fromDate + "&to=" + toDate;

	request(url, function (error, response, body) {
  		if (error || response.statusCode !== 200) {
			defer.reject("Get LastFM data error");
		} else {
			try {
				var data = JSON.parse(body);
				if(!data || !data.recenttracks || !data.recenttracks['@attr']) return defer.reject("Could not parse recent tracks data");
                promiseData.songCount = data.recenttracks['@attr'].total;
                defer.resolve(promiseData);
			} catch(err){
				defer.reject(err);
			}
		}
	});
    return defer.promise;
}

function save(data) {
    var defer = Q.defer();

    var doc = new lastFMSchema({
        songCount: data.songCount,
        artistCount: data.artistCount,
        topArtists: data.topArtists
    });

    doc.save(function(err) {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve();
        }
    });

    return defer.promise;
}

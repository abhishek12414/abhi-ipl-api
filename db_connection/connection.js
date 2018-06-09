const   express = require('express'),
        mongoose = require('mongoose'),
        matches = require('../models/matches'),
        deliveries = require('../models/deliveries')

mongoose.connect('mongodb://localhost:27017/ipl');
mongoose.connection.on('open', () => {
    console.log("Connected with database");
});

// match all season
const getSeasons =() => {
    return new Promise((resolve, reject) => {
        matches.aggregate([
            { $group: { _id: '$season' } },
            { $project: { _id: 0, year: '$_id' } },
            { $sort: { year: 1 } }
        ], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    })
}

const getYear = (year) => {
    return new Promise((resolve, reject) => {
        matches.aggregate([
            { $match: { season: Number(year) } },
            { $group: { _id: '$team1' } },
            { $project: { _id: 0, team: '$_id' } },
            { $sort: { team_name: 1 } }
        ], (err, result) => {
            if (err) { 
                reject(err); 
            } else { 
                resolve(result);
            }
        });
    });
}

function getTeam(year, teamname) {
    return new Promise((resolve, reject) => {
        matches.aggregate([
            { $group: { _id: '$season', count: { $sum: 1 }
                }
            }, {
                $sort: { _id: 1 }
            }], (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
    })
}

module.exports = {
    getSeasons,
    getYear
}
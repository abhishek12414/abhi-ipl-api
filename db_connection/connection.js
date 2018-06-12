const express = require('express'),
    mongoose = require('mongoose'),
    matches = require('../models/matches'),
    deliveries = require('../models/deliveries')

mongoose.connect('mongodb://localhost:27017/ipl');
mongoose.connection.on('open', () => {
    console.log("Connected with database");
});

// match all season
const getSeasons = () => {
    return new Promise((resolve, reject) => {
        matches.aggregate([
            { $group: { _id: '$season' } },
            { $project: { _id: 0, year: '$_id' } },
            { $sort: { year: 1 } }
        ], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.map(years => {
                    return years.year;
                }));
            }
        });
    })
}

const getTeams = (year) => {
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
                resolve(result.map(team => { return team.team }));
            }
        });
    });
}

function getPlayers(year, teamname) {    
    return new Promise((resolve, reject) => {
        matches.aggregate([
            { $match: { $and: [{ season: year }, { $or: [{ team1: teamname }, { team2: teamname }] }] } },
            { $group: { _id: '$id' }  },
            { $sort: { _id: 1 } }
        ], (err, result) => {
            if (err) {
                reject(err);
            } else {
                deliveries.aggregate([
                    {
                        $match: {
                            match_id: { $gte: result[0]._id, $lte: result[result.length - 1]._id }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                matchId: '$match_id',
                                player: {
                                    $cond: [
                                        { $eq: ['$batting_team', teamname] },
                                        '$batsman', {
                                            $cond: [
                                                { $eq: ['$bowling_team', teamname] },
                                                '$bowler', ''
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            player: '$_id.player'
                        }
                    },
                    {
                        $group: { _id: '$player' }
                    }, {
                        $project: { _id: 0, name: '$_id' }
                    },
                    {
                        $sort: { name: 1 }
                    }
                ], (err, result) => {
                    if (err)
                        reject(err);
                    else {
                        let names = result.map((acc, nameObj) => {
                            return acc.name;
                        })
                        names = names.filter(name => name != '');
                        resolve(names);
                    }
                });
            }
        });
    })
}

module.exports = {
    getSeasons,
    getTeams,
    getPlayers
}
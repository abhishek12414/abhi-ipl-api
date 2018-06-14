const express = require('express'),
    mongoose = require('mongoose'),
    matches = require('../models/matches'),
    deliveries = require('../models/deliveries')

mongoose.connect('mongodb://localhost:27017/ipl');
mongoose.connection.on('open', () => {
    console.log("Connected with database");
    // getPlayerProfile(2009, 'Deccan Chargers', 'AC Gilchrist')
});

// match all season
const getSeasons = () => {
    return new Promise((resolve, reject) => {
        matches.aggregate([
            {
                $group: {
                    _id: '$season',
                    count: { $sum: 1 }
                }
            }, {
                $project: {
                    _id: 0,
                    year: '$_id',
                    matches: '$count'
                }
            }, {
                $sort: { year: 1 }
            }]
            , (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
    });
}

const getTeams = (year) => {
    return new Promise((resolve, reject) => {
        matches.aggregate([
            { $match: { season: Number(year) } },
            { $group: { _id: '$winner', count: { $sum: 1 } } },
            { $project: { _id: 0, team: '$_id', totalWon: '$count' } },
            { $sort: { totalWon: -1 } }
        ], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

const getPlayers = (year, teamName) => {
    return new Promise((resolve, reject) => {
        matches.aggregate([
            { $match: { $and: [{ season: year }, { $or: [{ team1: teamName }, { team2: teamName }] }] } },
            { $group: { _id: '$id' } },
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
                                        { $eq: ['$batting_team', teamName] },
                                        '$batsman', {
                                            $cond: [
                                                { $eq: ['$bowling_team', teamName] },
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

getPlayerProfile = (year, teamName, playerName) => {
    return new Promise((resolve, reject) => {
        matches.aggregate([
            { $match: { $and: [{ season: year }, { $or: [{ team1: teamName }, { team2: teamName }] }] } },
            { $group: { _id: '$id' } },
            { $sort: { _id: 1 } }
        ], (err, result) => {
            if (err) {
                reject(err);
            } else {
                // console.log(result);
                deliveries.aggregate([
                    {
                        $match: {
                            $and: [
                                {
                                    match_id: {
                                        $gte: result[0]._id,
                                        $lte: result[result.length - 1]._id
                                    },
                                    batsman: playerName
                                },

                            ]
                        }
                    }, {
                        $group: {
                            _id: '$batsman',
                            runs: { $sum: '$batsman_runs' },
                            six: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$batsman_runs', 6] },
                                        1, 0
                                    ]
                                }
                            },
                            four: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$batsman_runs', 4] },
                                        1, 0
                                    ]
                                }
                            },
                            dismiss: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$player_dismissed', playerName] },
                                        1, 0
                                    ]
                                }
                            },
                            caught: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$dismissal_kind', 'caught'] },
                                        1, 0
                                    ]
                                }
                            },
                            bowled: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$dismissal_kind', 'bowled'] },
                                        1, 0
                                    ]
                                }
                            },
                            runout: {
                                $sum: {
                                    $cond: [
                                        { $eq: ['$dismissal_kind', 'run out'] },
                                        1, 0
                                    ]
                                }
                            },
                        }
                    }, {
                        $project: {
                            _id: 0,
                            name: '$_id',
                            bowled: '$bowled',
                            caught: '$caught',
                            dismiss: '$dismiss',
                            four: '$four',
                            runout: '$runout',
                            runs: '$runs',
                            six: '$six'
                        }
                    }
                ], (err, result) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result[0]);
                    }
                })
            }
        });
    });
}

module.exports = {
    getSeasons,
    getTeams,
    getPlayers,
    getPlayerProfile
}
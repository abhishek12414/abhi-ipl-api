const   mongoose    = require('mongoose');
        express     = require('express');
        router      = express.Router();
        dbMethod    = require('../db_connection/connection')

// Api endpoints
router.get('/:year/:teamname/:playername', (req, res)=>{
    if(req.params.playername === null)
        res.send(400).send('Invalid Request');
    dbMethod.getPlayerProfile(Number(req.params.year), req.params.teamname, req.params.playername).then(playersProfile=>{
        if(playersProfile != null)
            res.status(200).send(playersProfile);
        else
            res.status(404).send({msg: 'Record not found'});
    });
});

router.get('/:year/:teamname', (req, res)=>{
    if(req.params.year == null || req.params.teamname == null)
        res.send(400).send('Invalid Request');
    dbMethod.getPlayers(Number(req.params.year), req.params.teamname).then(players=>{
        if(players != null)
            res.status(200).send(players);
        else
            res.status(404).send('Record not found');
    });
});
        
router.get('/:year', (req, res)=>{
    if(req.params.year == null)
        res.send(400).send('Invalid Request');
    dbMethod.getTeams(req.params.year).then(teams=>{
        if(teams != null)
            res.status(200).send(teams);
        else
            res.status(404).send('Record not found');
    });
});

router.get('/', (req, res)=>{
    dbMethod.getSeasons().then(season=>{
        if(season != null)
            res.status(200).send(season)
        else
            res.status(404).send('Record not found')
    })    
})

module.exports = router;
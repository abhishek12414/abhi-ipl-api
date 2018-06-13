const   mongoose    = require('mongoose');
        express     = require('express');
        router      = express.Router();
        dbMethod    = require('../db_connection/connection')

// Api endpoints
router.get('/:year/:teamname', (req, res)=>{
    if(req.params.year == null || req.params.teamname == null)
        res.send(404).send('Invalid Request');
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


// router.get('/:year/:teamname', (req, res)=>{
//     console.log('year', req.params.year)
//     dbMethod.getTeam(req.params.year, req.params.teamname).then(teams=>{
//         console.log(x)
//         res.status(200).send('asdf')
//     })    
// })

module.exports = router;
const   mongoose    = require('mongoose');
        express     = require('express');
        router      = express.Router();
        dbMethod    = require('../db_connection/connection')

// Api endpoints
router.get('/:year/:teamname', (req, res)=>{
    dbMethod.getPlayers(Number(req.params.year), req.params.teamname).then(players=>{
        res.status(200).send(players)
    });
});
        
router.get('/:year', (req, res)=>{
    dbMethod.getTeams(req.params.year).then(teams=>{
        res.status(200).send(teams)
    });
});

router.get('/', (req, res)=>{
    dbMethod.getSeasons().then(season=>{
        res.status(200).send(season)
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
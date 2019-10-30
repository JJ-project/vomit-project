var express = require("express");
var router = express.Router();
var movies = require("../data.json");

router.get('/', function(req, res){ // /api/movies
    res.send(movies);
});

router.get("/:id", function(req, res){ // /api/movies/:id
    var id = parseInt(req.params.id, 10);
    var movie = movies.filter(function (movie) { return movie.id === id });
    res.send(movie);
});

module.exports = router;
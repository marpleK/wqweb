const express = require('express');
const router = express.Router();
const games = require('../controllers/games');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateGame } = require('../middleware');

const Game = require('../models/game');

router.route('/')
    .get(catchAsync(games.index))
    .post(isLoggedIn, catchAsync(games.createGame))


router.get('/new_load_single', isLoggedIn, games.renderNewLoadSingle)

router.get('/new_load_multiple', isLoggedIn, games.renderNewLoadMultiple)

router.get('/new_online', isLoggedIn, games.renderNewOnline)

router.route('/:id')
    .get(catchAsync(games.showGame))
    .put(isLoggedIn, isAuthor, catchAsync(games.updateGame))
    .delete(isLoggedIn, isAuthor, catchAsync(games.deleteGame));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(games.renderEditForm))



module.exports = router;
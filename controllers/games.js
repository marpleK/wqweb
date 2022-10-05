const Game = require('../models/game');
const moment = require('moment');

module.exports.index = async (req, res) => {
    const games = await Game.find({});
    res.render('games/index', { games, moment: moment })
}

module.exports.renderNewLoadSingle = (req, res) => {
    res.render('games/new_load_single');
}

module.exports.renderNewLoadMultiple = (req, res) => {
    res.render('games/new_load_multiple');
}

module.exports.renderNewOnline = (req, res) => {
    res.render('games/new_online');
}

module.exports.createMultipleGame = async (req, res, next) => {
    const game = new Game(req.body.game);
    game.author = req.user._id;
    game.owner = req.user.username;
    await game.save();
    req.flash('success', '成功！');

}

module.exports.createGame = async (req, res, next) => {
    const game = new Game(req.body.game);
    game.author = req.user._id;
    game.owner = req.user.username;
    await game.save();
    req.flash('success', '成功！');
    res.redirect(`/games/${game._id}`)
}

module.exports.showGame = async (req, res,) => {
    const game = await Game.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!game) {
        req.flash('error', '找不到該棋局！');
        return res.redirect('/games');
    }
    res.render('games/show', { game });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const game = await Game.findById(id)
    if (!game) {
        req.flash('error', '找不到該棋局!');
        return res.redirect('/games');
    }
    res.render('games/edit', { game });
}

module.exports.updateGame = async (req, res) => {
    const { id } = req.params;
    const game = await Game.findByIdAndUpdate(id, { ...req.body.game });
    req.flash('success', '更新成功！');
    res.redirect(`/games/${game._id}`)
}

module.exports.deleteGame = async (req, res) => {
    const { id } = req.params;
    await Game.findByIdAndDelete(id);
    req.flash('success', '刪除成功！')
    res.redirect('/games');
}
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((fav) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(fav);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOne({user: req.user._id})
	.then((fav) => {
		if (fav == null) {
			fav = new Favorite({user: req.user._id, dishes: []});
		}
		req.body.forEach((dish) => {
			if (fav.dishes.indexOf(dish._id) === -1) {
				fav.dishes.push(dish);
			}
		});
		fav.save()
		.then((fav) => {
			Favorite.find({user: req.user._id})
			.then((fav) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }, (err) => next(err));
		}, (err) => next(err));
	}, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOneAndRemove({user: req.user._id})
	.then((rem) => {
		res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(rem);
	}, (err) => next(err))
	.catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOne({user: req.user._id})
	.then((fav) => {
		if (fav == null) {
			fav = new Favorite({user: req.user._id, dishes: []});
		}
		if (fav.dishes.indexOf(req.params.dishId) === -1) {
			fav.dishes.push(req.params.dishId);
			fav.save()
			.then((fav) => {
				Favorite.find({user: req.user._id})
				.then((fav) => {
	                res.statusCode = 200;
	                res.setHeader('Content-Type', 'application/json');
	                res.json(fav);
	            }, (err) => next(err));
			}, (err) => next(err));
		} else {
			res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fav);
		}
	}, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorite.findOne({user: req.user._id})
	.then((fav) => {
		if (fav != null) {
			found = fav.dishes.indexOf(req.params.dishId);
			if (found !== -1) {
				fav.dishes.splice(found, 1);
				fav.save()
				.then((fav) => {
					Favorite.find({user: req.user._id})
					.then((fav) => {
		                res.statusCode = 200;
		                res.setHeader('Content-Type', 'application/json');
		                res.json(fav);
		            }, (err) => next(err));
				}, (err) => next(err));
			} else {
				err = new Error('Dish: ' + req.params.dishId +' not found on /favorites');
	            err.status = 403;
	            return next(err);
			}
		} else {
			err = new Error('Favorite dishes list not found');
            err.status = 403;
            return next(err);
		}
	}, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;
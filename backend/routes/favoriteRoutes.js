const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.use(protect); // All favorites require authentication

router.route('/')
  .get(getFavorites);

router.route('/:providerId')
  .post(addFavorite)
  .delete(removeFavorite);

module.exports = router;

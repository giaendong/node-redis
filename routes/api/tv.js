const mongoose = require('mongoose');
const moment = require('moment');
const axios = require('axios');
const router = require('express').Router();
const auth = require('../auth');
const redisMiddleware = require('../redis')

router.get('/configuration', auth.optional, redisMiddleware, async (req, res, next) => {
  const result = await axios.get('https://api.themoviedb.org/3/configuration', {
    params: {
      api_key: process.env.TMDB_API_KEY,
    }
  }).then(function (response) {
    return response
  }).catch(function (error) {
    // handle error
    return error.response;
  });
  if (result.status !== 200) {
    return res.status(result.status).send(result.data);
  }
  return res.json(result.data);
});

router.get('/genre', auth.optional, redisMiddleware, async (req, res, next) => {
  const result = await axios.get('https://api.themoviedb.org/3/genre/tv/list', {
    params: {
      api_key: process.env.TMDB_API_KEY,
      language: 'en-US',
    }
  }).then(function (response) {
    return response
  }).catch(function (error) {
    // handle error
    return error.response;
  });
  if (result.status !== 200) {
    return res.status(result.status).send(result.data);
  }
  return res.json(result.data);
});

router.get('/discover', auth.optional, redisMiddleware, async (req, res, next) => {
    const { query: { page, genre }} = req;
    const result = await axios.get('https://api.themoviedb.org/3/discover/tv', {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'en-US',
        sort_by: 'popularity.desc',
        page: page || 1,
        timezone: 'America/New_York',
        include_null_first_air_dates: false,
        with_genres: genre
      }
    }).then(function (response) {
      return response
    }).catch(function (error) {
      // handle error
      return error.response;
    });
    if (result.status !== 200) {
      return res.status(result.status).send(result.data);
    }
    return res.json(result.data);
  });

  router.get('/:id', auth.optional, redisMiddleware, async (req, res, next) => {
    const { params: { id }, query: { season, episode }} = req;
    const result = await axios.get(
      `https://api.themoviedb.org/3/tv/${id}${
        season && !episode ? '/season/' + season : ''}${
          season && episode ? '/season/' + season + '/episode/' + episode : ''}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'en-US'
      }
    }).then(function (response) {
      return response
    }).catch(function (error) {
      // handle error
      return error.response;
    });
    if (result.status !== 200) {
      return res.status(result.status).send(result.data);
    }
    return res.json(result.data);
  });

  module.exports = router;
'use strict'

const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors')
const {authorize} = require('./authorize')
const Role = require('./Role.json')
const userHandler = require('./handlers/user_handlers')

const APP_SETTINGS = require('./PRIVATE_APP_SETTINGS.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/images/', express.static( __dirname + '/uploads/images/'));

app.use(cors())

function errorHandler(error, res) {
  console.error(error)
  return res.status(500).json(error)
}

// --------- USER ROUTES ---------

app.post('/users/login', function(req, res){
    return userHandler.login(req.body, res)
    .then(function(result){
      return result
    }).catch(err => {errorHandler(err, res)})  
  })  

  app.post('/users/register', function(req, res){
    return userHandler.register(req.body, res)
    .then(function(result){
      return result
    }).catch(err => {errorHandler(err, res)})  
  })  

  app.get('/users', authorize(Role.Admin), function(req, res){
    return userHandler.getUsers()
    .then(function(result){
      return res.status(200).json(result)
    }).catch(err => {errorHandler(err, res)})  
  })  

  app.get('/users/:user_id', authorize(), function(req, res){
    return userHandler.getOneUser(req.user, req.params.user_id, res)
    .then(function(result){
      return result
    }).catch(err => {errorHandler(err, res)})  
  })  

  app.delete('/users/:user_id', authorize(), function(req, res){
    return userHandler.deleteUser(req.user, req.params.user_id, res)
    .then(function(result){
      return result
    }).catch(err => {errorHandler(err, res)})  
  })  

  app.put('/users/:user_id', authorize(), function(req, res){
    return userHandler.modifyUser(req.user, req.params.user_id, req.body, res)
    .then(function(result){
      return result
    }).catch(err => {errorHandler(err, res)})  
  })

  app.listen(APP_SETTINGS.port, () => {
    console.log('Running on port ' + APP_SETTINGS.port);
  });
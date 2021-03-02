"use strict"

const Sequelize = require('sequelize');
const PRIVATE = require('./PRIVATE_DB_CREDENTIALS.json')

require('pg').defaults.parseInt8 = true

let connnectionStr = "postgres://"+PRIVATE.user+":"+PRIVATE.password+"@"+PRIVATE.host+"/"+PRIVATE.dbname;

let sequelize = new Sequelize(connnectionStr, {logging: false});

let User = sequelize.define('user', {
    id: {type: Sequelize.BIGINT, primaryKey: true, allowNull: false, autoIncrement: true},
    username: {type: Sequelize.STRING, allowNull: false},
    password: {type: Sequelize.STRING, allowNull: false},
    role: {type: Sequelize.STRING, allowNull: false},
})

module.exports = {
    database: sequelize.sync(),
    User
}
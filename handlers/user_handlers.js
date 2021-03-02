const settings = require('../PRIVATE_APP_SETTINGS.json');
const jwt = require('jsonwebtoken');
const {User} = require('../schema')
const crypto = require('crypto')

function login(req, res) {
    const hash = crypto.createHmac('sha512', settings.hash_secret)
    return User.findOne( {
        where: {
            username: req.username,
            password: hash.update(req.password).digest('hex')
        },
        raw: true
    }).then(user => {
        if (user) {
            const token = jwt.sign({ sub: user.id, role: user.role }, settings.auth_secret, {expiresIn: '7d'});
            const { password, ...userWithoutPassword } = user;
            return res.status(200).json({
                ...userWithoutPassword,
                token
            })
        } else {
            return res.status(401).json({message: 'wrong username or password'})
        }
    })
}

async function register(req, res) {
    const hash = crypto.createHmac('sha512', settings.hash_secret)
    const sameUser = await User.findOne({where: {username: req.username}})
    if (sameUser)
        return res.status(409).json({message: 'Username already used'})
    if (!req.role) {
        req.role = 'User'
    }
    return User.create({
        username: req.username,
        password: hash.update(req.password).digest('hex'),
        role: req.role,
    }).then(userCreated => {
        user = userCreated.dataValues
        const {password, ...userWithoutPassword} = user
        return res.status(200).json(userWithoutPassword)
    })
}

function getUsers() {
    return User.findAll({raw: true}).then(users => {
        return users.map(u => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword
        });
    })
}

function getOneUser(currUser, userId, res) {
    if (currUser.sub != parseInt(userId) && currUser.role != 'Admin')
        return  res.status(401).json({message: 'Unauthorized'})
    return User.findOne({
        where: {
            id: userId
        },
        raw: true
    }).then(user => {
        if (!user) {
            return res.status(404).json({message: 'User not found'})
        }
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword)
    })
}

function deleteUser(currUser, userId, res) {
    if (parseInt(userId) === currUser.sub) {
        return res.status(409).json({message: "you can't delete your own user"})
    }
    return User.findOne({
        where: {
            id: userId
        }
    }).then(user => {
        if (!user) {
            return res.status(404).json({message: "user not found"})
        }
        return user.destroy().then(() => {
            return res.status(200).json({message: 'user sucessfully deleted'})
        })
    })
}

function modifyUser(currUser, userId, req, res) {
    const hash = crypto.createHmac('sha512', settings.hash_secret)
    if (currUser.sub !== parseInt(userId) && currUser.role !== 'Admin')
        return  res.status(401).json({message: 'Unauthorized'})
    return User.findOne({
        where: {
            id: userId
        },
    }).then(async user => {
        if (!user) {
            return res.status(404).json({message: "user not found"})
        }
        if (user.username != req.username) {
            const sameUser = await User.findOne({where: {username: req.username}})
            if (sameUser)
                return res.status(409).json({message: 'Username already used'})
        }
        user.username = req.username
        user.password = hash.update(req.password).digest('hex')
        if (req.role && currUser.role === "Admin" && currUser.sub !== parseInt(userId))
            user.role = req.role
        return user.save().then(userModified=> {
            userModifiedRaw = userModified.dataValues
            const { password, ...userWithoutPassword } = userModifiedRaw;
            return res.status(200).json(userWithoutPassword)
        })
    })
}

module.exports = {
    login: login,
    register: register,
    getUsers: getUsers,
    getOneUser: getOneUser,
    deleteUser: deleteUser,
    modifyUser: modifyUser
}
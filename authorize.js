const jwt = require('express-jwt');
const settings = require('./PRIVATE_APP_SETTINGS.json');
const {User} = require('./schema')

function authorize(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return [
        jwt({ secret: settings.auth_secret, algorithms: ['HS256'] }),
        async (req, res, next) => {
            const user = await User.findOne({where: {id: req.user.sub}})
            if ((roles.length && !roles.includes(req.user.role)) || !user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            next(); 
        }
    ];
}

function errorAuthorizeHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        return res.status(400).json({ message: err });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Invalid Token' });
    }

    return res.status(500).json({ message: err.message });
}

module.exports = {
    authorize: authorize,
    errorAuthorizeHandler: errorAuthorizeHandler,
}
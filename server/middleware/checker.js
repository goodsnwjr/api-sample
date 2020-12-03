module.exports = function() {
  const app = require('../server');
  const utils = require('../../common/utils');

  return (req, res, next) => {
    const User = app.models.user;

    if (req.accessToken) {
      User.findOne({ where: { id: req.accessToken.userId } }, function (err, user) {
        if (user) {
          user['isAdmin'] = (user.role === 'admin');
          req['userInfo'] = user;
          return next();
        } else {
          return next(utils.e(401, 'no user'));
        }
      });
    } else {
      return next();
    }
  };
};

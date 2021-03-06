'use strict';

module.exports = (User) => {
  const app = require('../../server/server');

  User.register = (data, cb) => {
    User.create(
      {
        ...data,
      },
      function (err) {
        if (err) return cb(null, err);
        return cb(null, data);
      },
    );
  };

  User.remoteMethod('register', {
    accepts: {
      arg: 'credentials',
      type: { email: 'string', password: 'string' },
      required: true,
      http: { source: 'body' },
    },
  });

  // User.profile = (id, cb) => {
  //   User.findOne({
  //     where: {
  //       id: id,
  //     },
  //   }).then((result) => {
  //     if (result) {
  //       return cb(null, result);
  //     } else {
  //       return cb(null, 'no profile');
  //     }
  //   });
  // };

  User.updateUser = (data, cb) => {
    User.findOne({
      where: {
        email: data.email,
      },
    })
      .then((result) => {
        if (result) {
          result.updateAttribute(
            'password',
            data.password,
            function (err, user) {
              if (user) {
                User.upsertWithWhere(
                  {
                    email: data.email,
                  },
                  {
                    ...data,
                  },
                );
                return cb(null, user);
              } else {
                return cb(null, err);
              }
            },
          );
        } else {
          return cb(null, 'err');
        }
      })
      .catch((error) => {
        console.log('User.updateUserPassword : ', error);
        return cb(null, error);
      });
  };

  User.remoteMethod('updateUser', {
    accepts: {
      arg: 'credentials',
      type: { email: 'string', password: 'string' },
      required: true,
      http: { source: 'body' },
    },
  });

  User.deleteUser = (id, cb) => {
    User.destroyAll(
      {
        email: id,
      },
      (err, res) => {
        if (err) return cb(err);
        return cb(null, res);
      },
    );
  };

  User.beforeRemote('count', function (context, modelInstance, next) {
    return next();
  });
  User.observe('before save', function (context, next) {
    console.log(context);
    const updatedDate = new Date();

    if (context.instance) {
      if (context.instance.id) {
        delete context.instance['created'];
        context.instance.updated = updatedDate;
      } else {
        context.instance.created = updatedDate;
        context.instance.updated = updatedDate;
      }
    } else {
      if (!context.currentInstance) {
        return next();
      } else {
        delete context.data['created'];
        context.data.updated = updatedDate;
      }
    }

    return next();
  });

  User.beforeRemote('register', function (context, modelInstance, next) {
    // if (context.args && context.args.data && !context.args.data.grade) {
    //   context.args.data.grade = '1';
    // }
    return next();
  });

  User.beforeRemote('updateUser', function (context, modelInstance, next) {
    return next();
  });

  User.afterRemote('login', function (context, result, next) {
    User.findOne({
      where: {
        email: context.args.credentials.email,
      },
    })
      .then((res) => {
        if (!res) {
          return next('no active user');
        }
        result.profile = res;
        return next();
      })
      .catch((err) => {
        return next(err);
      });
  });

  User.remoteMethod('login', {
    accepts: {
      arg: 'credentials',
      type: { email: 'string', password: 'string' },
      required: true,
      http: { source: 'body' },
    },
  });

  User.remoteMethod('logout', {
    accepts: {
      arg: 'credentials',
      type: { access_token: 'string' },
      required: true,
      http: { source: 'body' },
    },
  });

  User.profile = function (req, cb) {
    const accessToken = app.models.AccessToken;
    let _user = null;

    accessToken
      .findOne({
        where: {
          _id: req.accessToken.id,
        },
      })
      .then((res) => {
        if (!res) {
          return cb(null, 'no user');
        }
        User.findOne({
          where: {
            _id: res.userId,
          },
        })
          .then((res) => {
            _user = res;
            return cb(null, _user);
          })
          .catch((err) => {
            return cb(null, err);
          });
      })
      .catch((err) => {
        return cb(null, err);
      });
  };
};

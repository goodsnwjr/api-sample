'use strict';

module.exports = (Contents) => {
  const app = require('../../server/server');

  Contents.observe('before save', function (context, next) {
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

  Contents.beforeRemote('create', function (context, modelInstance, next) {
    const board = app.models.Board;
    board
      .findOne({
        where: {
          type: context.args.data.type,
        },
      })
      .then((res) => {
        if (!res) {
          return next('no user');
        }
        board
          .upsert({
            ...res,
            contents: context,
          })
          .then((res) => {
            if (!res) {
              return next('no user');
            }
            return next(res);
          });

        // User.findOne({
        //   where: {
        //     _id: res.userId,
        //   },
        // })
        //   .then((res) => {
        //     _user = res;
        //     return cb(null, _user);
        //   })
        //   .catch((err) => {
        //     return cb(null, err);
        //   });
      })
      .catch((err) => {
        return next(err);
      });

    return next();
  });
};

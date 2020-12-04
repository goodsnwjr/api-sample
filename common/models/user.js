'use strict';

module.exports = (User) => {
  User.register = (data, cb) => {
    const newUser = User.create({
      ...data,
    });
    return cb(null, newUser);
  };

  User.updateUser = (id, data, cb) => {
    User.update(
      {
        email: id,
      },
      {
        ...data,
      },
      (err, res) => {
        if (err) return cb(err);
        return cb(null, res);
      },
    );
  };

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
  User.beforeRemote('find', function (context, modelInstance, next) {
    const user = context.req.userInfo;
    if (user) {
      if (!context.args.filter) {
        context.args.filter = {
          where: { isBuyer: true, ownerId: user.id },
        };
      } else if (!context.args.filter.where) {
        context.args.filter.where = {
          isBuyer: true,
          ownerId: user.id,
        };
      } else {
        context.args.filter.where.isBuyer = true;
        context.args.filter.where.ownerId = user.id;
      }
    }
    return next();
  });

  User.beforeRemote('count', function (context, modelInstance, next) {
    const user = context.req.userInfo;
    if (user) {
      if (!context.args.where) {
        context.args.where = { ownerId: user.id, isBuyer: true };
      } else {
        context.args.where.ownerId = user.id;
        context.args.where.isBuyer = true;
      }
    }
    return next();
  });
  User.observe('before save', function (context, next) {
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
    if (context.args && context.args.data && !context.args.data.level) {
      context.args.data.level = '1';
    }
    return next();
  });

  User.beforeRemote('updateUser', function (context, modelInstance, next) {
    if (!context.args.data) {
      User.find({ where: { email: context.args.id } }).then((res) => {
        console.log(res);
        if (res) {
          context.args.data = res;
        }
        return next();
      });
    }
    return next();
  });

  // User.beforeRemote(
  //   'prototype.patchAttributes',
  //   function (context, modelInstance, next) {
  //     if (
  //       context.args &&
  //       context.args.data &&
  //       context.args.data.status === 'deleted'
  //     ) {
  //       const deleteEmail = context.instance.email + '.deleted';

  //       // check email
  //       User.find({ where: { email: deleteEmail } }).then((res) => {
  //         if (res.length) {
  //           context.args.data.email = deleteEmail + '.' + res.length;
  //         } else {
  //           context.args.data.email = deleteEmail;
  //         }
  //         return next();
  //       });
  //     } else {
  //       return next();
  //     }
  //   },
  // );
};

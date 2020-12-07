'use strict';

module.exports = (User) => {
  User.register = (data, cb) => {
    const newUser = User.create({
      ...data,
    });
    return cb(null, newUser);
  };

  User.updateUser = (data, cb) => {
    User.findOne({
      where: {
        email: data.eamil,
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
    if (context.args && context.args.data && !context.args.data.grade) {
      context.args.data.grade = '1';
    }
    return next();
  });

  User.beforeRemote('updateUser', function (context, modelInstance, next) {
    // console.log(context.args.data.password);
    // if (context.args.data) {
    //   User.findOne({ where: { email: context.args.id } }).then((res) => {
    //     console.log('res :', res[0].password);
    //     if (res) {
    //       if (context.args.data.password !== res[0].password) {
    //         // User.changePassword(
    //         //   context.args.data.password,
    //         //   res[0].id,
    //         //   res[0].password,
    //         //   function (err) {
    //         //     if (err) console.log(err);
    //         //     return next();
    //         //   },
    //         // );
    //       } else {
    //         return next();
    //       }
    //     } else {
    //       return next();
    //     }
    //   });
    // }
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

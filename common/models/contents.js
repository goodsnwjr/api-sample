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

  Contents.createPost = (data, cb) => {
    const board = app.models.Board;

    board
      .findById(data.boardIdData[0], {})
      .then((res) => {
        if (!res) return cb(null, '게시판 존재하지 않음.');
        Contents.create({
          ...data,
        })
          .then((res) => {
            return cb(null, res);
          })
          .catch((err) => {
            return cb(null, err);
          });
      })
      .catch((err) => {
        return cb(null, '게시판 존재하지 않음.');
      });
  };

  Contents.afterRemote('find', function (context, modelInstance, next) {
    // const board = app.models.Board;
    // if (context.result.boardIdData) {
    //   board
    //     .findOne({
    //       where: {
    //         type: context.args.data.boardIdData,
    //       },
    //     })
    //     .then((res) => {
    //       if (!res) {
    //         return next('no board');
    //       } else {
    //         return next();
    //       }
    //     });
    // } else {
    //   return next('게시판이 없음');
    // }

    return next();
  });
};

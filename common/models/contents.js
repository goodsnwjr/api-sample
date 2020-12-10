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
          comment: [],
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

  Contents.createComment = (contentsId, comment, email, cb) => {
    Contents.findById(contentsId, {})
      .then((res) => {
        res.comment.push({ email, comment });
        let comments = res.comment;
        Contents.update({
          comment: comments,
        });
        return cb(null, res);
      })
      .catch((err) => {
        return cb(null, err);
      });
  };

  Contents.afterRemote(
    'createComment',
    function (context, modelInstance, next) {
      if (context.args.contentsId) {
        Contents.findById(context.args.contentsId, {})
          .then((res) => {
            // context.result.comment = [];
            // modelInstance.comment.push(context.args.comment);
            return next();
          })
          .catch((err) => {
            return next(err);
          });
      } else {
        return next();
      }
    },
  );

  Contents.beforeRemote(
    'createComment',
    function (context, modelInstance, next) {
      let comment = context.args.comment;
      // return next();
      if (context.args.contentsId) {
        // context.args.comment = [];
        // context.args.comment.push(comment);
        return next();
      } else {
        return next();
      }
    },
  );

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

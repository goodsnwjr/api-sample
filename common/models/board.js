'use strict';

module.exports = (Board) => {
  const app = require('../../server/server');

  Board.observe('before save', function (context, next) {
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

  Board.beforeRemote('create', function (context, modelInstance, next) {
    Board.findOne({
      where: {
        title: context.args.data.title,
      },
    }).then((res) => {
      if (res) return next('이미 있는 게시판입니다');
      else return next();
    });
  });
};

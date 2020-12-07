'use strict';

module.exports = (Board) => {
  const app = require('../../server/server');

  Board.observe('before save', function (context, next) {
    console.log(context.args);
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
    return next();
  });
};

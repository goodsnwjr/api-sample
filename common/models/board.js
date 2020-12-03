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

  Board.beforeRemote('find', function (context, modelInstance, next) {
    const owner = context.req.userInfo,
      ownerId = owner ? owner.ownerId || owner.id.toString() : undefined;

    if (!context.args.filter) {
      context.args.filter = {};
    }

    if (context.args.filter.where) {
      if (context.args.filter.where.and) {
        context.args.filter.where.and.push({
          status: { neq: 'deleted' },
          ownerId: ownerId,
        });
      } else {
        context.args.filter.where = {
          and: [
            context.args.filter.where,
            {
              status: { neq: 'deleted' },
              ownerId: ownerId,
            },
          ],
        };
      }
    } else {
      context.args.filter['where'] = {
        status: { neq: 'deleted' },
        ownerId: ownerId,
      };
    }

    return next();
  });

  Board.beforeRemote('create', function (context, modelInstance, next) {
    context.args.data.ownerId = context.req.userInfo.id.toString();
    return next();
  });
};

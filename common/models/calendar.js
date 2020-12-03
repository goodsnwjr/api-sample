'use strict';

module.exports = Calendar => {

  Calendar.observe('before save', function(context, next) {
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

  Calendar.beforeRemote('find', function(context, modelInstance, next) {
    if (!context.args.filter) {
      context.args.filter = {};
    }

    if (context.args.filter.where) {
      if (context.args.filter.where.and) {
        context.args.filter.where.and.push({
          status: { neq: 'deleted' },
          ownerId: context.req.userInfo.ownerId || context.req.userInfo.id.toString()
        });
      } else {
        context.args.filter.where = {
          and: [
            context.args.filter.where,
            {
              status: { neq: 'deleted' },
              ownerId: context.req.userInfo.ownerId || context.req.userInfo.id.toString()
            }
          ]
        };
      }
    } else {
      context.args.filter['where'] = {
        status: { neq: 'deleted' },
        ownerId: context.req.userInfo.ownerId || context.req.userInfo.id.toString()
      };
    }

    return next();
  });

  Calendar.beforeRemote('count', function(context, modelInstance, next) {
    if (context.args.where && context.args.where.and) {
      context.args.where.and.push({
        status: { neq: 'deleted' },
        ownerId: context.req.userInfo.ownerId || context.req.userInfo.id.toString()
      });
    } else {
      context.args.where = {
        and: [
          context.args.where,
          {
            status: { neq: 'deleted' },
            ownerId: context.req.userInfo.ownerId || context.req.userInfo.id.toString()
          }
        ]
      };
    }

    return next();
  });

  Calendar.beforeRemote('create', function(context, modelInstance, next) {
    context.args.data.ownerId = context.req.userInfo.id.toString();
    return next();
  });
};

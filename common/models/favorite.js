'use strict';

module.exports = (Favorite) => {
  const app = require('../../server/server');
  Favorite.observe('before save', function (context, next) {
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

  Favorite.beforeRemote('create', function (context, modelInstance, next) {
    Favorite.findOne({
      where: {
        title: context.args.data.title,
      },
    }).then((res) => {
      if (res) return next('이미 있는 게시판입니다');
      else return next();
    });
  });

  Favorite.addFavorite = (userId, videoId, cb) => {
    const user = app.models.User;
    user
      .findOne({
        where: {
          id: userId,
        },
      })
      .then((res) => {
        Favorite.find({ where: { userId: userId } }).then((res) => {
          console.log(res);
          if (res.length) {
            Favorite.updateAll(
              { userId: userId },
              { videoId: videoId },
              (err) => {
                if (err) return cb(null, err);
                return cb(null, { userId: userId, videoId: videoId });
              },
            );
          } else {
            Favorite.create(
              {
                userId: userId,
                videoId: videoId,
              },
              function (err) {
                if (err) return cb(null, err);
                return cb(null, videoId);
              },
            );
          }
        });

        // return cb(null, res);
      })
      .catch((err) => {
        return cb(null, err);
      });
  };
};

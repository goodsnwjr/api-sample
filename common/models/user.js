"use strict";

const TLSSigAPIv2 = require("tls-sig-api-v2");
const axios = require("axios");
const md5 = require("md5");

module.exports = (User) => {
  User.sig = (userid, roomid, cb) => {
    const api = new TLSSigAPIv2.Api(
      process.env.SDK_API_ID,
      process.env.SDK_APP_KEY
    );
    return cb(null, {
      sdkAppId: process.env.SDK_API_ID,
      userSig: api.genSig(userid, 604800),
    });
  };

  User.profile = (req, cb) => {
    return cb(null, req.userInfo);
  };

  User.registBuyer = (data, req, cb) => {
    const owner = req.userInfo;

    if (!owner) return cb("NO_OWNER");
    if (!owner.mini_appid || !owner.mini_secret) return cb("NOT_MINI_USER");

    axios
      .get("https://api.weixin.qq.com/sns/jscode2session", {
        params: {
          appid: owner.mini_appid,
          secret: owner.mini_secret,
          js_code: data.code,
          grant_type: "authorization_code",
        },
      })
      .then(async (_wres) => {
        const openId = _wres.data.openid;
        if (!openId) {
          return cb(_wres.data.errmsg);
        }
        const uid = md5(openId);

        delete data.code;

        try {
          // check uid uniqueness
          const isDuplicated = await User.findOne({
            where: { uid: uid, status: { neq: "deleted" } },
          });

          if (isDuplicated) {
            return cb({
              message: "already exists",
              target: isDuplicated,
            });
          }

          const newUser = await User.create({
            ...data,
            ownerId: owner.id,
            isBuyer: true,
            active: true,
            uid,
            session_key: _wres.data.session_key,
            openid: _wres.data.openid,
            password: owner.password,
          });
          return cb(null, newUser);
        } catch (error) {
          return cb(error);
        }
      })
      .catch((err) => {
        cb(err);
      });
  };

  User.updateBuyer = (id, data, req, cb) => {
    const owner = req.userInfo;

    if (!owner) return cb("NO_OWNER");

    User.update(
      {
        id,
      },
      {
        ...data,
        updated: new Date(),
      },
      (err, res) => {
        if (err) return cb(err);
        User.findOne({ where: { id: id } })
          .then((target) => {
            return cb(null, target);
          })
          .catch((err) => {
            return cb(err);
          });
      }
    );
  };

  User.findBuyerByCode = (code, req, cb) => {
    const owner = req.userInfo;
    if (!owner) {
      return cb("NO_OWNER");
    }
    axios
      .get("https://api.weixin.qq.com/sns/jscode2session", {
        params: {
          appid: owner.mini_appid,
          secret: owner.mini_secret,
          js_code: code,
          grant_type: "authorization_code",
        },
      })
      .then(async (_wres) => {
        const openId = _wres.data.openid;
        if (!openId) {
          return cb(_wres.data.errmsg);
        }
        const uid = md5(openId);

        User.findOne({
          where: { uid: uid, status: { neq: "deleted" } },
          order: "created DESC",
        })
          .then((res) => {
            if (!res) {
              return cb("NO_BUYER");
            }
            return cb(null, res);
          })
          .catch((error) => {
            return cb(error);
          });
      })
      .catch((err) => {
        return cb(err);
      });
  };

  User.beforeRemote("find", function (context, modelInstance, next) {
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

  User.beforeRemote("count", function (context, modelInstance, next) {
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
  User.observe("before save", function (context, next) {
    const updatedDate = new Date();

    if (context.instance) {
      if (context.instance.id) {
        delete context.instance["created"];
        context.instance.updated = updatedDate;
      } else {
        context.instance.created = updatedDate;
        context.instance.updated = updatedDate;
      }
    } else {
      if (!context.currentInstance) {
        return next();
      } else {
        delete context.data["created"];
        context.data.updated = updatedDate;
      }
    }

    return next();
  });

  User.beforeRemote("prototype.patchAttributes", function (
    context,
    modelInstance,
    next
  ) {
    if (context.args && context.args.data && context.args.data.status === "deleted") {
      const deleteEmail = context.instance.email + ".deleted";

      // check email
      User.find({ where: { email: deleteEmail } }).then((res) => {
        if (res.length) {
          context.args.data.email = deleteEmail + "." + res.length;
        } else {
          context.args.data.email = deleteEmail;
        }
        return next();
      });
    } else {
      return next();
    }
  });
};

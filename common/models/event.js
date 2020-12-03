"use strict";

module.exports = (Event) => {
  const app = require("../../server/server");
  const { formatNumber } = require("../utils");
  const { produce } = require("immer");

  Event.observe("before save", function (context, next) {
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

  Event.beforeRemote("find", function (context, modelInstance, next) {
    const owner = context.req.userInfo,
      ownerId = owner ? owner.ownerId || owner.id.toString() : undefined;

    if (!context.args.filter) {
      context.args.filter = {};
    }

    if (context.args.filter.where) {
      if (context.args.filter.where.and) {
        context.args.filter.where.and.push({
          status: { neq: "deleted" },
          ownerId: ownerId,
        });
      } else {
        context.args.filter.where = {
          and: [
            context.args.filter.where,
            {
              status: { neq: "deleted" },
              ownerId: ownerId,
            },
          ],
        };
      }
    } else {
      context.args.filter["where"] = {
        status: { neq: "deleted" },
        ownerId: ownerId,
      };
    }

    return next();
  });

  Event.beforeRemote("count", function (context, modelInstance, next) {
    if (context.args.where && context.args.where.and) {
      context.args.where.and.push({
        status: { neq: "deleted" },
        ownerId:
          context.req.userInfo.ownerId || context.req.userInfo.id.toString(),
      });
    } else {
      context.args.where = {
        and: [
          context.args.where,
          {
            status: { neq: "deleted" },
            ownerId:
              context.req.userInfo.ownerId ||
              context.req.userInfo.id.toString(),
          },
        ],
      };
    }

    return next();
  });

  Event.beforeRemote("create", function (context, modelInstance, next) {
    context.args.data.ownerId = context.req.userInfo.id.toString();
    return next();
  });

  Event.afterRemote("find", function (context, modelInstance, next) {
    const User = app.models.user;
    let targetBuyerIds = [];
    context.result.forEach((x) => {
      if (x.buyerId) {
        targetBuyerIds.push(x.buyerId);
      }
    });
    User.find({ where: { id: { inq: targetBuyerIds } } }).then((_buyers) => {
      let buyers = {};
      _buyers.forEach((b) => {
        buyers[b.id] = b;
      });

      context.result = context.result.map((x) => {
        if (x.buyerId) {
          x.buyer = buyers[x.buyerId];
        }
        return x;
      });

      return next();
    });
  });

  const oneDay = 1000 * 3600 * 24,
    serverTz = new Date().getTimezoneOffset(),
    allBrands = [
      '890311',
      '090factory',
      'gegenuber',
      'GREEDILOUS',
      'CAHIERS',
      'NOIXTE',
      'NU PARCC',
      'NUPER',
      'NEUL',
      'darcygom',
      'the STOLEN GARMENT',
      'DOUCAN',
      'DIDIBOYU',
      'D-ANTIDOTE',
      'LIE',
      'lo axual',
      'ROCKET X LUNCH',
      'RICK RHE',
      'MANOD',
      'MARAETHRA',
      'MAEDY',
      'MERLIC',
      'Monteeth',
      'BROWN HAT',
      'BLAXIII',
      'BLUER',
      'VEGAN TIGER',
      'BIG PARK',
      'BEANPOLE ACCESSORY',
      'SAIMI JEON',
      'SEOKWOON YOON',
      'SU GI',
      "STUDIO D'aaRI",
      'STUDIO SEONG',
      'C-ZANN E',
      'SETSETSET',
      'AYU',
      'iCE GARDEN',
      'EYEYE',
      'Oct31',
      'UNNORM',
      'URBAN EDITION',
      'UL:KIN',
      'EGOVERO',
      'A.BELL',
      'ENSUE',
      'UXION',
      'UNIC+A',
      'jamiewander',
      'JCHOI',
      'GEMMA ALUS',
      'JULYCOLUMN ',
      'CARNET-ARCHIVE',
      'convexo concave',
      'COMSPACE NINETEENEIGHTY',
      'COKIE',
      'KI LEE',
      'TIBAEG',
      'fakonion',
      'PAINTERS',
      'feltandson',
      'FLENO SEOUL',
      'FLOUD',
      'Finoacinque',
      'HYEON.K',
      'HOLY NUMBER 7',
      'KWAK HYUN JOO COLLECTION',
      'GRAPHISTE MAN.G',
      'THE GREATEST',
      'MÜNN',
      'BAROQUE',
      "BY.D'BY",
      'BLANC de NOIRS',
      'BMUET(TE)',
      'SAINT MILL',
      'SLING STONE',
      'aimons',
      'KUMANN YOO HYE JIN',
      ' PARTsPARTs',
      'Hanacha studio',
      ' MAXXIJ',
      'modernable',
      '02 ARMOIRE ',
      'NOTKNOWING',
      'IRYUK',
      '중복참여'
    ],
    disableDates = ['2020-10-20', '2020-10-24', '2020-10-25'];

  Event.timeTable = (data, req, cb) => {
    const { startDate, endDate, startTime, endTime, timeOffset = 0 } = data;

    let start = new Date(startDate),
      end = new Date(endDate);

    const timeTableLength = endTime - startTime;
    if (timeTableLength < 0) {
      return cb("WRONG_TIME");
    }

    const dateTableLength = Math.ceil(
      (end.getTime() - start.getTime()) / oneDay
    );

    if (dateTableLength < 0) {
      return cb("WRONG_DATE");
    }

    let timeTables = {}, disableTimeTables = {};
    for (let i = 0; i < timeTableLength; i++) {
      const t = startTime + i - (serverTz - (serverTz - timeOffset)) / 60;
      timeTables[t] = {
        meridiem: t < 12 ? "am" : "pm",
        text: `${formatNumber(t)}:00 - ${formatNumber(t + 1)}:00`,
        value: startTime + i,
        disabled: [],
      };
      disableTimeTables[t] = {
        meridiem: t < 12 ? "am" : "pm",
        text: `${formatNumber(t)}:00 - ${formatNumber(t + 1)}:00`,
        value: startTime + i,
        disabled: allBrands,
      };
    }

    let dateTables = {};
    for (let i = 0; i < dateTableLength; i++) {
      const d = `${start.getFullYear()}-${formatNumber(
        start.getMonth() + 1
      )}-${formatNumber(start.getDate() + i)}`;
      if(disableDates.includes(d)) {
        dateTables[d] = { ...disableTimeTables };
      }else {
        dateTables[d] = { ...timeTables };
      }
    }

    Event.find({
      where: {
        start: { gte: start },
        end: { lte: end },
        buyerId: { exists: true },
        state: "active",
      },
      order: "start ASC",
    }).then((res) => {
      res.forEach((x) => {
        const _start = x.start,
          y = _start.getFullYear(),
          m = _start.getMonth() + 1,
          d = _start.getDate(),
          h = _start.getHours() + (serverTz - timeOffset) / 60,
          key = `${y}-${formatNumber(m)}-${formatNumber(d)}`;

        dateTables = produce(dateTables, (draft) => {
          if (draft[key] && draft[key][h]) {
            draft[key][h].disabled.push(x.title);
          }
        });
      });

      return cb(null, dateTables);
    });
  };
};

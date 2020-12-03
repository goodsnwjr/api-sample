const moment = require('moment');
const fs = require('fs');

module.exports = {
  // error
  e: (status, message, code) => {
    /*
     * message list
     * NOT ALLOWED
     * NO RESOURCE
     * SAME CODE
     * NO TEAM
     * NO PARAMETER
     * WRONG CODE
     * TIME ERROR
     * NOT SUPPORT
     */

    let error = new Error();
    error.statusCode = status;
    error.message = message;
    error.code = code;
    return error;
  },
  // utils
  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   */
  getRandomArbitrary: (min, max) => {
    return Math.random() * (max - min) + min;
  },
  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   */
  getRandomInt: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  getUserIP: (req) => {
    var ipAddress;

    if (!!req.hasOwnProperty('sessionID')) {
      ipAddress = req.headers['x-forwarded-for'];
    } else {
      if (!ipAddress) {
        var forwardedIpsStr = req.header('x-forwarded-for');

        if (forwardedIpsStr) {
          var forwardedIps = forwardedIpsStr.split(',');
          ipAddress = forwardedIps[0];
        }
        if (!ipAddress) {
          ipAddress = req.connection.remoteAddress;
        }
      }
    }
    return ipAddress;
  },
  // read template
  readHTMLFile: (path, callback) => {
    fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
      if (err) {
        callback(err);
      } else {
        callback(null, html);
      }
    });
  },
  // check if http exists in front of the url
  checkHttp: (link) => {
    if (link.substring(0, 4) != 'http') {
      return 'http://' + link;
    } else return link;
  },
  // generate random string
  randomString: function(length, chars) {
    let mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxy';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    let result = '';

    for (let i = length; i > 0; --i)
      result += mask[Math.floor(Math.random() * mask.length)];

    return result;
  },
  makeCouponbox: function(couponbox) {
    couponbox.data.name = couponbox.data.name.split(':')[0];

    let prizeCount = 0;
    for (let i = 0; i < couponbox.data.coupons.length; i++) {
      if (couponbox.data.coupons[i].codeSequence == process.env.PRIZE_CS) {
        prizeCount = prizeCount + 1;
      }
    }

    let stampCount = 0;
    for (let i = 0; i < couponbox.data.coupons.length; i++) {
      if (couponbox.data.coupons[i].codeSequence == process.env.STAMP_CS) {
        stampCount = stampCount + 1;
      }
    }

    const remainCount = stampCount - (prizeCount * 10);
    let coupons = [];
    for (let i = 0; i < couponbox.data.coupons.length; i++) {
      if (couponbox.data.coupons[i].codeSequence == process.env.STAMP_CS) {
        coupons.push(couponbox.data.coupons[i]);
        if (coupons.length >= remainCount) {
          break;
        }
      }
    }

    return {
      coupons: coupons,
      name: couponbox.data.name,
      trackingId: couponbox.data.trackingId,
      couponbox: couponbox.data.couponbox,
    }
  },
  formatNumber: function(num, length = 2) {
    const n = num.toString();
    return n.length >= length ? n : new Array(length - n.length + 1).join('0') + num;
  }
};

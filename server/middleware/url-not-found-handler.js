module.exports = function () {
  return function customRaiseUrlNotFoundError(req, res, next) {
    res.sendFile('path to 404.html', function (err) {
        if (err) {
            console.error(err);
            res.status(err.status).end();
        }
    });
  };
};

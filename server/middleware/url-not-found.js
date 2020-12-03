module.exports = urlNotFound;

function urlNotFound() {
  return function raiseUrlNotFoundError(req, res) {
    console.log('raiseUrlNotFoundError');
    var options = {
      root: __dirname,
    };

    res.sendFile('404.html', options, function(err) {
      if (err) {
        console.log(err);
        res.status(err.status).end();
      }
    });
  };
}

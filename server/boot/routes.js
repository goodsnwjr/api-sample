module.exports = function (app) {
  var User = app.models.user;

  app.post('/login', function (req, res) {
    User.login(
      {
        email: req.body.email,
        password: req.body.password,
      },
      'user',
      function (err, token) {
        if (err) {
          res.render('response', {
            //render view named 'response.ejs'
            title: 'Login failed',
            content: err,
            redirectTo: '/',
            redirectToLinkText: 'Try again',
          });
          return;
        }

        res.render('home', {
          //login user and render 'home' view
          email: req.body.email,
          accessToken: token.id,
        });
      },
    );
  });

  //log a user out
  app.get('/logout', function (req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
    User.logout(req.accessToken.id, function (err) {
      if (err) return next(err);
      res.redirect('/');
    });
  });
};

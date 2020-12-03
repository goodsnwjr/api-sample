module.exports = function(options) {
  return function logError(err, req, res, next) {
    console.log(err);
    res.send("<!doctypehtml><title>Error</title><style>body{text-align:center;padding:150px;}h1{font-size:50px;}body{font:20pxHelvetica,sans-serif;color:#333;}article{display:block;text-align:left;width:650px;margin:0auto;}a{color:#dc8100;text-decoration:none;}a:hover{color:#333;text-decoration:none;}</style><article><h1>Noop!</h1><div><p>does not support.</p><p>&mdash;The Team</p></div></article>");
  };
};
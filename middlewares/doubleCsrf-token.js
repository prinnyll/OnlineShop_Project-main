const addDoubleCsrf = (req, res, next) => {
  res.locals.doubleCsrfToken = req.csrfToken();
  next();
};

module.exports = addDoubleCsrf;

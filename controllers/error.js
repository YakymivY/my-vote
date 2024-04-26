const ErrorController = {
    notFound: (req, res) => {
      const userId = req.cookies.userId ? req.cookies.userId : null;
      res.status(404).render('404', {userId});
    },
  };
  
  module.exports = ErrorController;
  
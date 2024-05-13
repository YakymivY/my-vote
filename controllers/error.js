const ErrorController = {
  notFound: (req, res) => {
    const userId = req.cookies.token ? req.cookies.token : null;
    res.status(404).json({ userId });
  },
};

module.exports = ErrorController;

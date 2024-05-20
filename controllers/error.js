const ErrorController = {
  notFound: (req, res) => {
    const tokenString = req.headers["authorization"]
      ? req.headers["authorization"]
      : null;
    const token = tokenString && tokenString.split(" ")[1];
    res.status(404).json({ userId });
  },
};

module.exports = ErrorController;

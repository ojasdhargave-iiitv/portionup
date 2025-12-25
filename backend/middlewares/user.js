const usermiddleware = (req, res, next) => {
    // Add your user authentication logic here
    next();
};

module.exports = usermiddleware;

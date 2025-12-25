const adminmiddleware = (req, res, next) => {
    // Add your admin authentication logic here
    next();
};

module.exports = adminmiddleware;

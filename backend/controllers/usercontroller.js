const usersignuppost = (req, res) => {
    res.json({ message: "User signup endpoint" });
};

const usermealpost = (req, res) => {
    res.json({ message: "User meal post endpoint" });
};

const usermealget = (req, res) => {
    res.json({ message: "User meal get endpoint" });
};

module.exports = { usersignuppost, usermealpost, usermealget };

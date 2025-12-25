const adminsignuppost = (req, res) => {
    res.json({ message: "Admin signup endpoint" });
};

const adminmealpost = (req, res) => {
    res.json({ message: "Admin meal post endpoint" });
};

const adminmealget = (req, res) => {
    res.json({ message: "Admin meal get endpoint" });
};

module.exports = { adminsignuppost, adminmealpost, adminmealget };

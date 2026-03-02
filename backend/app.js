const express= require('express');
const cors = require('cors');
const app = express();
const PORT=3000;
const adminRouter = require('./routes/admin.js');
const userRouter = require('./routes/user.js');
const bodyParser = require('body-parser');
const db = require('./models/db.js');

app.use(cors());
app.use(bodyParser.json());

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use("/admin",adminRouter);
app.use("/user",userRouter);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
    console.log(`Access from network: http://172.19.10.46:${PORT}`);
}); 
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
app.use("/admin",adminRouter);
app.use("/user",userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
}); 
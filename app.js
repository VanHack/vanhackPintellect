var app = require('./config/express')();

app.listen(3000, function() {
    console.log("Server started, please goto http://localhost:3000");
})

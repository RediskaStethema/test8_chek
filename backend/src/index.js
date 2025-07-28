const port = require('./utils/constants').PORT
const app = require('./app');


app.listen(port, () => console.log('Backend running on http://localhost:' + port));

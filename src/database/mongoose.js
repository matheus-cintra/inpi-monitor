const mongoose = require('mongoose');

const mongoConnect = async () => {
  return new Promise(resolve => {
    mongoose
      .connect('mongodb://localhost/monitor-inpi', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.warn('MongoDB Running');
        resolve();
      });
  });
};

module.exports = { mongoConnect };

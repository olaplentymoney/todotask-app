const fs = require('fs');
const path = require('path');
const { Users } = require('../DB_Model/user');

const userDBpath = path.join(__dirname, '..', 'DB_MOdel', 'user.json');

function getAllUsers() {
  return new Promise((resolve, reject) => {
    Users.find()
      .then((users) => {
        resolve(users);
      })
      .catch((err) => reject(err));
  });
}

// async function getAllUsers() {
//   return fs.readFile(userDBpath, 'utf-8', (err, users) => {
//     if (err) {
//       return err;
//     }

//     return JSON.parse(users);
//   });
// }

// try {
//   await getAllUsers();
// } catch (error) {}

function authenticate(req, _) {
  return new Promise((resolve, reject) => {
    const header = req.headers['authorization'];

    if (!header || !header.startsWith('Basic'))
      return reject('Invalid Auth Header');

    const basicAuth = header.split(' ')[1];

    const decoded = Buffer.from(basicAuth, 'base64').toString('utf-8');

    const [username, password] = decoded.split(':');

    getAllUsers().then((users) => {
      const user = users.find((u) => {
        return username === u.username && password === u.password;
      });

      if (!user)
        return reject('User not found! Enter a valid User name or sign up.');

      req.user = user;
      resolve();
    });
  });
}

const LogLevel = {
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  ERROR: 'ERROR',
};

/**
 * Using a closure to create a logger for this system
 * */
const useLogger = (arg) => {
  return (...args) => {
    const FORMAT = `[LOG LEVEL] ${LogLevel[arg]} : ${args}\n[TIMESTAMP]: ${Date.now()}`;
    switch (arg) {
      case LogLevel.ERROR:
        console.error(FORMAT);
        break;
      case LogLevel.INFO:
        console.info(FORMAT);
        break;
    }
  };
};

module.exports = {
  authenticate,
  useLogger,
  LogLevel,
};

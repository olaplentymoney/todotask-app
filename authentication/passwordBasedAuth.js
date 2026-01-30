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

const getUserByUserName = (params = { username, password }) => {
  return Users.findOne({ ...params })
    .select('-tasks -password') // remove password from projection
    .then((user) => {
      // return user if found
      return user;
    });
};

function login(req, res) {
  // take body
  const body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  });
  // parse body
  req.on('end', () => {
    const data = Buffer.concat(body).toString();
    const { username, password } = JSON.parse(data);

    if (
      !username ||
      !password ||
      (!typeof username === 'string' && typeof password === 'string') ||
      !password.trim().length ||
      !username.trim().length
    ) {
      res.writeHead(400);
      return res.end('Invalid username or password');
    }

    // find user
    getUserByUserName({ username, password })
      .then((user) => {
        if (!user) {
          res.writeHead(404);
          return res.end('Invalid username or password');
        }
        res.writeHead(200);
        res.end(JSON.stringify(user));
      })
      .catch((err) => {
        useLogger(LogLevel.ERROR)(err);
        res.writeHead(500);
        res.end('Something went wrong!!!');
      });

    // Users.findOne({ username, password })
    //   .select('-tasks -password') // remove password from projection
    //   .then((user) => {
    //     // return error if not found
    //     if (!user) {
    //       res.writeHead(404);
    //       return res.end('User not found!!');
    //     }

    //     // return user if found
    //     res.writeHead(200);
    //     res.end(JSON.stringify({ user }));
    //   })
  });
}

function signup(req, res) {
  // parse body
  const body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  });

  req.on('end', () => {
    const buffer = Buffer.concat(body).toString();

    const { username, password, email } = JSON.parse(buffer);

    if (
      !username ||
      !password ||
      !email ||
      !username.trim().length ||
      !password.trim().length ||
      !email.trim().length
    ) {
      res.writeHead(400);
      return res.end('Invalid username or password');
    }

    getUserByUserName({ username })
      .then((user) => {
        if (user) {
          console.log(user);
          res.writeHead(409);
          return res.end('Username unavailable');
        }

        Users.create({ username, password, email })
          .then((doc) => {
            doc
              .save()
              .then(() => {
                res.writeHead(200);
                res.end('User created successfully');
              })
              .catch((err) => {
                res.writeHead(500);
                res.end(err);
              });
          })
          .catch((e) => {
            useLogger(LogLevel.ERROR)(e);
            res.writeHead(500);
            res.end('Something went wrong!!!');
          });
      })
      .catch((err) => {
        useLogger(LogLevel.ERROR)(err);
        res.writeHead(500);
        res.end('Something went wrong!!!');
      });
  });
  // hash password

  // pass hashed data into DB
  // return success if everything is fine
  // return error if not fine
}

// utility function
function handleAsync(fn) {
  return (req, res) => {
    return new Promise((reject, resolve) => {
      fn(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };
}

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

      resolve({ user });
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
  handleAsync,
  login,
  signup,
};

const http = require('http');
const url = require('url');
require('dotenv').config();
const {
  authenticate,
  useLogger,
  LogLevel,
  login,
  signup,
} = require('./authentication/passwordBasedAuth');
const { connectToMongoDB } = require('./db.js');
const { Tasks } = require('./DB_Model/task.js');
const { default: mongoose } = require('mongoose');

//Establishes connection to Database
connectToMongoDB();
//const userDBpath = path.join(__dirname, 'DB', 'user.json');

const PORT = process.env.PORT || 3000;
const HOST_NAME = 'localHost';

const requestHandler = async (req, res) => {
  console.log(`[ROUTE] [${req.url}]`);

  const { pathname } = url.parse(req.url, true);
  res.setHeader('Content-Type', 'Application/json');

  // higher order function
  const protect = (handler) => {
    return (req, res) => {
      return authenticate(req, res)
        .then((context) => {
          req.user = context;
          return handler(req, res);
        })
        .catch((err) => {
          const log = useLogger('ERROR');
          log(err);
          res.writeHead(err.status || 401);
          res.end(err.message || 'Unauthorized');
        });
    };
  };

  const routes = {
    GET: {
      '/todo': protect(getAllTodoTasks),
    },
    POST: {
      '/todo': protect(addTodoTask),
      '/auth/login': login,
      '/auth/signup': signup,
    },
    DELETE: {
      '/todo': protect(deleteTodoTask),
    },
    PUT: {
      '/todo': protect(updateTodoTask),
    },
  };

  const handler = routes?.[req.method]?.[pathname];
  if (!handler) {
    res.writeHead(404);
    return res.end('No matching route in this API');
  }

  handler(req, res);
};

//GET METHOD
function getAllTodoTasks(req, res) {
  const user = req.user;
  Tasks.find({ userId: user.id })
    .then((todos) => {
      res.writeHead(200);
      res.end(JSON.stringify(todos));
    })
    .catch((err) => {
      useLogger(LogLevel.ERROR)(err);
      res.writeHead(400);
      res.end('Something went wrong!!!');
    });
}

//POST METHOD
function addTodoTask(req, res) {
  const body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  });

  req.on('end', () => {
    const buffer = Buffer.concat(body).toString();
    const task = JSON.parse(buffer);

    const user = req.user;

    Tasks.create({ userId: user.id, ...task })
      .then((doc) =>
        doc
          .save()
          .then((todos) => {
            res.writeHead(200);
            res.end('Task created successfully');
          })
          .catch((err) => {
            useLogger('ERROR')(err);
            res.writeHead(400);
            res.end('Could not save data');
          }),
      )
      .catch((err) => {
        useLogger(LogLevel.ERROR)(err);
        res.writeHead(400);
        res.end('Something went wrong!!!');
      });
  });
}

//PUT METHOD
function updateTodoTask(req, res) {
  const body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  });

  req.on('end', () => {
    const buffer = Buffer.concat(body).toString();
    const data = JSON.parse(buffer);

    const user = req.user;

    Tasks.findOneAndUpdate({ _id: data.id, userId: user.id }, data, {
      runValidators: true,
    })
      .then((doc) => {
        if (!doc) {
          res.writeHead(404);
          res.end('Task not found!');
          return;
        }
        res.writeHead(200);
        res.end('Task updated successfully');
      })
      .catch((err) => {
        useLogger(LogLevel.ERROR)(err);
        res.writeHead(500);
        res.end('Something went wrong!!!');
      });
  });
}

//DELETE METHOD
function deleteTodoTask(req, res) {
  const body = [];

  req.on('data', (chunk) => {
    body.push(chunk);
  });

  req.on('end', () => {
    const buffer = Buffer.concat(body).toString();
    const task = JSON.parse(buffer);

    const user = req.user;

    Tasks.findOneAndDelete({ _id: task.id, userId: user.id })
      .then((doc) => {
        if (!doc) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        res.writeHead(200);
        res.end('Task deleted successfully');
      })
      .catch((err) => {
        useLogger(LogLevel.ERROR)(err);
        res.writeHead(500);
        res.end('Something went wrong');
      });
  });
}

////SERVER
const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server started on http://${HOST_NAME}:${PORT}`);
});

process.on('SIGINT', async () => {
  useLogger('INFO')('Application shutting down');
  await mongoose.connection.close(); // close database connection
  server.close();
});

process.on('unhandledRejection', async (err) => {
  useLogger('ERROR')(err);
  server.close();
});

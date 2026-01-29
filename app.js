const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
require('dotenv').config();
const {
  authenticate,
  useLogger,
  LogLevel,
} = require('./authentication/passwordBasedAuth');
const { connectToMongoDB } = require('./db.js');
const { Tasks } = require('./DB_Model/task.js');
const { default: mongoose } = require('mongoose');

//Establishes connection to Database
connectToMongoDB();
//const userDBpath = path.join(__dirname, 'DB', 'user.json');
const pathName = path.join(__dirname, 'DB_Model', 'task.json');

const PORT = process.env.PORT || 3000;
const HOST_NAME = 'localHost';

const todoTaskObj = fs.readFileSync(pathName, 'utf-8');

const parsedTodoObj = JSON.parse(todoTaskObj);

const saveTodo = ({ pathname, data, cb }) => {
  fs.writeFile(pathname, data, (err) => {
    if (err) {
      return cb(err);
    }
    cb(null, data);
  });
};

const requestHandler = async (req, res) => {
  const { pathname } = url.parse(req.url, true);
  res.setHeader('Content-Type', 'Application/json');

  //READ TO-DO TASK
  if (pathname === '/to-do-task' && req.method === 'GET') {
    authenticate(req, res)
      .then(() => {
        getAllTodoTasks(req, res);
      })
      .catch((err) => {
        const log = useLogger('ERROR');
        log(err);
        res.writeHead(500);
        res.end(JSON.stringify({ message: err }));
      });
  }

  //INSERT/CREATE TO-DO TASK
  else if (pathname === '/to-do-task' && req.method === 'POST') {
    authenticate(req, res)
      .then(() => {
        addTodoTask(req, res);
      })
      .catch((err) => {
        useLogger(LogLevel.ERROR)(err);
        res.writeHead(500);
        res.end(JSON.stringify({ message: err }));
      });
  }

  //UPDATE TO-DO TASK
  else if (pathname === '/to-do-task' && req.method === 'PUT') {
    authenticate(req, res)
      .then(() => {
        updateTodoTask(req, res);
      })
      .catch((err) => {
        res.writeHead(500);
        res.end(JSON.stringify({ message: err }));
      });
  }

  //DELETE TO-DO TASK
  else if (pathname === '/to-do-task' && req.method === 'DELETE') {
    authenticate(req, res)
      .then(() => {
        deleteTodoTask(req, res);
      })
      .catch((err) => {
        res.writeHead(500);
        res.end(JSON.stringify({ message: err }));
      });
  } else {
    res.writeHead(404);
    res.end('Not matching route in this API');
  }
};

//GET METHOD
async function getAllTodoTasks(req, res) {
  const user = req.user;
  const todo = await Tasks.find({ userId: user.id });
  // const userTask = parsedTodoObj.filter((task) => task.userId === user.id);
  res.writeHead(200);
  res.end(JSON.stringify(todo));
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

//PUT METTOD
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

server.listen(PORT, HOST_NAME, () => {
  console.log(`Server started on http://${HOST_NAME}:${PORT}`);
});

process.on('SIGINT', async () => {
  useLogger('INFO')('Application shutting down');
  await mongoose.connection.close(); // close database connection
});

process.on('unhandledRejection', async (err) => {
  useLogger('ERROR')(err);
  server.close();
});

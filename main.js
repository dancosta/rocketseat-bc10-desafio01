const express = require('express');

const server = express();

const appPort = 3000;


// the "store" of the app
const projectStore = [];


server.use(express.json());

//register global middleware function 
server.use(requestLog);
//Routes

//POST /projects  with 'id' and 'title'
// sotring objects like: { id: "1", title: 'Novo projeto', tasks: [] }
server.post('/projects', (req, res) => {
  const { id, title } = req.body;

  if (!findProjectById(id)) {
    const project = creatProject(id, title);
    projectStore.push(project);
  }
  return res.send(projectStore);

});

//GET /projects
server.get('/projects', (req, res) => {
  return res.send(projectStore);
});

//PUT /projects/:id change only the title of the project
server.put('/projects/:id', checkProjectExists, (req, res) => {
  const { title } = req.body;
  console.log('title from body', title);

  const id = req.params.id;
  console.log('given id', id);

  const projIdx = findProjectIndexById(id);
  console.log(projIdx);

  if (projIdx != -1) {
    changeTitle(projIdx, title);
  }

  return res.send(projectStore);
});

//DELETE /projects/:id
server.delete('/projects/:id', checkProjectExists, (req, res) => {
  const id = req.params.id;

  const projIdx = findProjectIndexById(id);
  if (projIdx != -1) {
    projectStore.splice(projIdx, 1);
  }

  return res.send(projectStore);

});

//POST /projects/:id/tasks to create a task with the given TITLE to the given project id
server.post('/projects/:id/tasks', checkProjectExists, (req,res)=>{
  const id = req.params.id;
  const { title } = req.body;

  const projIdx = findProjectIndexById(id);
  if (projIdx != -1) {
    projectStore[projIdx].tasks.push(title);
  }

  return res.send(projectStore);
});

//auxiliar functions
//create a java object for new project
function creatProject(id, title) {
  return {
    'id': id,
    'title': title,
    tasks: []
  }

}

//search for a existing projct by its id
function findProjectById(id) {
  return projectStore.find(proj => proj.id === id);
}

function findProjectIndexById(id) {
  return projectStore.findIndex(proj => proj.id === id);
}

function changeTitle(index, title) {
  projectStore[index].title = title;
}

//Middleware functions
function requestLog(req, res, next) {
  console.time('Request');
  console.log(`${req.method}:${req.url}`);
  next();
  console.timeEnd('Request');
}

function checkProjectExists(req, res, next) {
  const { id } = req.params;
  if (!findProjectById(id)) {
    res.status(400).send({ error: `project id ${id} does not exist` });
  } else {
    next();
  }
}

//listen
server.listen(appPort, () => {
  console.log(`App listening on port ${appPort}!`);
});

const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const USERS = [{
  _id: userOneId,
  email: 'who1@ever.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'who2@ever.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, 'abc123').toString()
  }]
}];

const TODOS = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _userId: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _userId: userTwoId
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(TODOS);
  }).then(() => done());

  // User.remove({}).then(() => {
  //   return User.insertMany(USERS);
  // }).then(() => {
  //   Todo.remove({}).then(() => {
  //     return Todo.insertMany(TODOS);
  //   }).then(() => done());
  // });
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(USERS[0]).save();
    var userTwo = new User(USERS[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {TODOS, populateTodos, USERS, populateUsers};
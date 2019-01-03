const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

// Todo.remove({}).then((res) => {
//   console.log(res);
// });

// Todo.findOneAndRemove
// Todo.findByIdAndRemove

Todo.findOneAndRemove({_id: '5c2d7eb2c0baccd9e363d67f'}).then((todo) => {
  console.log(todo);
});

Todo.findByIdAndRemove('5c2d7eb2c0baccd9e363d67f').then((todo) => {
  console.log(todo);
});

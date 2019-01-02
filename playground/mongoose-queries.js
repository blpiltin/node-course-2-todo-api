const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5c2aba26a30eaa7504d6fd7e';

// if (!ObjectID.isValid(id)) {
//   return console.log('ID not valid');
// }

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos', todos);
// });

// // Advantageous because it doesn't return an array
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
//   if (!todo) {
//     return console.log('Id not found');
//   }
//   console.log('Todo By Id', todo);
// }).catch((err) => console.log(err));

User.findById(id).then((user) => {
  if (!user) {
    return console.log('User not found');
  }
  console.log('User By ID: \n', JSON.stringify(user, null, 2));
}).catch((err) => {
  if (!ObjectID.isValid(id)) {
    return console.log('ID invalid');
  }
  console.log(err);
});
// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server');

  // deleteMany
  // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((res) => {
  //   console.log(res);
  // });

  // deleteOne
  // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((res) => {
  //   console.log(res);
  // });

  // findOneAndDelete
  // db.collection('Todos').findOneAndDelete({
  //   completed: false
  // }).then((res) => {
  //   console.log(res);
  // });

  db.collection('Users').deleteMany({name: 'Brian Piltin'}).then((res) => {
    console.log(res);
  });

  db.collection('Users').findOneAndDelete({
    _id: new ObjectID('5c28398a6b069f4dc08eb629')
  }).then((res) => {
    console.log(JSON.stringify(res, undefined, 2));
  });

  //db.close();

});
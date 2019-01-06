const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {TODOS, populateTodos, USERS, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should not create todo with bad data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(TODOS.length);
          done();
        }).catch((err) => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(TODOS.length);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${TODOS[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(TODOS[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for invalid object ids', (done) => {
    request(app)
      .get('/todos/123abc')
      .expect(404)
      .end(done);
  });

});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexId = TODOS[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(TODOS[0].text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(hexId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for invalid object ids', (done) => {
    request(app)
      .delete('/todos/123abc')
      .expect(404)
      .end(done);
  });

});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var hexId = TODOS[0]._id.toHexString();
    var text = 'This is a test 1';

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        completed: true, 
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });

  it ('should clear completedAt when todo is not completed', (done) => {
    var hexId = TODOS[1]._id.toHexString();
    var text = 'This is a test 1';

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        completed: false, 
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a new user', (done) => {
    var email = 'who3@ever.com';
    var password = '123abc';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find({email}).then((users) => {
          expect(users.length).toBe(1);
          expect(users[0].email).toBe(email);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should not create user with bad data', (done) => {
    request(app)
      .post('/users')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find().then((users) => {
          expect(users.length).toBe(USERS.length);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should not create user with duplicate email', (done) => {
    var email = 'who1@ever.com';
    var password = '123abc';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find().then((users) => {
          expect(users.length).toBe(USERS.length);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should not create user with invalid email', (done) => {
    var email = 'who1@ever';
    var password = '123abc';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        
        User.find().then((users) => {
          expect(users.length).toBe(USERS.length);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should hash the user\'s password', (done) => {
    var email = 'who3@ever.com';
    var password = '123abc';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        
        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((err) => done(err));
      });
  });

});
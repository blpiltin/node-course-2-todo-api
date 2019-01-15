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
      .set('x-auth', USERS[0].tokens[0].token)
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
          expect(todos[0]._userId.toHexString()).toBe(USERS[0]._id.toHexString());
          done();
        }).catch((err) => done(err));
      });
  });

  it('should not create todo with bad data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', USERS[0].tokens[0].token)
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

  it('should prevent unauthorized user from creating todo', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(401)
      .end(done);
  });

});

describe('GET /todos', () => {
  it('should get all todos from correct user', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', USERS[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
        expect(res.body.todos[0]._userId).toBe(USERS[0]._id.toHexString());
        expect(res.body.todos[0]._userId).toNotBe(USERS[1]._id.toHexString());
      })
      .end(done);
  });

  it('should not get todos if unauthorized', (done) => {
    request(app)
      .get('/todos')
      .expect(401)
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${TODOS[0]._id.toHexString()}`)
      .set('x-auth', USERS[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(TODOS[0].text);
        expect(res.body.todo._userId).toBe(USERS[0]._id.toHexString());
        expect(res.body.todo._userId).toNotBe(USERS[1]._id.toHexString());
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', USERS[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for invalid object ids', (done) => {
    request(app)
      .get('/todos/123abc')
      .set('x-auth', USERS[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not return todo if unauthorized', (done) => {
    request(app)
      .get(`/todos/${TODOS[0]._id.toHexString()}`)
      .expect(401)
      .end(done);
  });

  it('should not return todo created by another user', (done) => {
    request(app)
      .get(`/todos/${TODOS[0]._id.toHexString()}`)
      .set('x-auth', USERS[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    var hexId = TODOS[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', USERS[0].tokens[0].token)
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
      .set('x-auth', USERS[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for invalid object ids', (done) => {
    request(app)
      .delete('/todos/123abc')
      .set('x-auth', USERS[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not return todo without token', (done) => {
    request(app)
      .delete(`/todos/${TODOS[0]._id.toHexString()}`)
      .expect(401)
      .end(done);
  });

  it('should not remove a todo created by other user', (done) => {
    var hexId = TODOS[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', USERS[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(hexId).then((todo) => {
          expect(todo).toExist();
          done();
        }).catch((err) => done(err));
      });
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    var hexId = TODOS[0]._id.toHexString();
    var text = 'This is a test 1';

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', USERS[0].tokens[0].token)
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
      .set('x-auth', USERS[1].tokens[0].token)
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

  it('should not update todo without token', (done) => {
    var hexId = TODOS[0]._id.toHexString();
    var text = 'This is a test 1';

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        completed: true, 
        text
      })
      .expect(401)
      .end(done);
  });

  it('should not update a todo created by another user', (done) => {
    var hexId = TODOS[0]._id.toHexString();
    var text = 'This is a test 1';

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', USERS[1].tokens[0].token)
      .send({
        completed: true, 
        text
      })
      .expect(404)
      .end(done);
  });
});

describe('GET /users/me', () => {

  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', USERS[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toEqual(USERS[0]._id.toHexString());
        expect(res.body.email).toBe(USERS[0].email);
      }).end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      }).end(done);
  });

});

describe('POST /users', () => {
  
  it('should create a user', (done) => {
    var email = 'who3@ever.com';
    var password = '123abc!';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((err) => done(err));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123'
      })
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

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: USERS[0].email, 
        password: '123abc!'})
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
});

describe('POST /users/login', () => {

  it ('should login user and return auth token', (done) => {
    var email = USERS[1].email;
    var password = USERS[1].password;

    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(USERS[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        })
        .catch((err) => done(err));
      });
  });

  it('should return error if email invalid', (done) => {
    var email = USERS[0].email + 'a';
    var password = USERS[0].password;

    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findById(USERS[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        })
        .catch((err) => done(err));
      });
  });

  it('should return error if password invalid', (done) => {
    var email = USERS[0].email;
    var password = USERS[0].password + '2';

    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) return done(err);

        User.findById(USERS[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        })
        .catch((err) => done(err));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should delete the user\'s token', (done) => {
    var email = USERS[0].email;
    var password = USERS[0].password;

    request(app)
      .delete('/users/me/token')
      .set('x-auth', USERS[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        User.findById(USERS[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        })
        .catch((err) => done(err));
      });
  });

  it('should not delete another user\'s token', (done) => {
    done();
  });
});
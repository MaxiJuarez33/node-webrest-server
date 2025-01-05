import request from 'supertest';
import { testServer } from '../../test-server';
import { prisma } from '../../../src/data/postgres';

describe('Todo rounte testing', () => {

    beforeAll(async() => {
        await testServer.start();
    });

    beforeEach(async() => {
        await prisma.todo.deleteMany();
    });

    afterAll(() => {
        testServer.close();
    });

    const todo1 = {text: 'Hola mundo1'}
    const todo2 = {text: 'Hola mundo2'}
    
    test('Should return TODOs', async () => {

        await prisma.todo.createMany({
            data: [todo1, todo2]
        });
        

        const {body} = await request(testServer.app)
         .get('/api/todos')
         .expect(200)

        expect(body).toBeInstanceOf(Array);
        expect(body.length).toBe(2);
        expect(body[1].text).toBe(todo2.text);
        expect(body[0].text).toBe(todo1.text);
        expect(body[0].completedAt).toBeNull();

    });

    test('Should return a todo api/todos/:id', async () => {

        const todo = await prisma.todo.create({data: todo1});

        const {body} = await request(testServer.app)
         .get(`/api/todos/${todo.id}`)
         .expect(200)


        expect(body).toEqual({
            id: todo.id,
            text: todo1.text,
            completedAt: null
        });
        
    });

    test('Should return a 404 NotFound api/todos/:id', async () => {

        const todo = await prisma.todo.create({data: todo1});

        const {body} = await request(testServer.app)
         .get(`/api/todos/3333`)
         .expect(404)


        expect(body).toEqual({error: 'Todo with id 3333 not found'});
    });


    test('Should return a new TODO api/todos/', async () => {
        const {body} = await request(testServer.app)
         .post('/api/todos')
         .send(todo1)
         .expect(201);

        expect(body).toEqual({
           id: expect.any(Number),
           text: todo1.text,
           completedAt: null
        });
    });

    test('Should return an error if text is not present api/todos/', async () => {
        const {body} = await request(testServer.app)
         .post('/api/todos')
         .send({})
         .expect(400);

        expect(body).toEqual({error: 'Text property is required'});
    });

    test('Should return an error if text is not present api/todos/', async () => {
        const {body} = await request(testServer.app)
         .post('/api/todos')
         .send({text: ''})
         .expect(400);

        expect(body).toEqual({error: 'Text property is required'});
    });

    test('Should return an updated TODO api/todos/:id', async () => {
        const todo = await prisma.todo.create({data:todo1});
        
        const {body} = await request(testServer.app)
         .put(`/api/todos/${todo.id}`)
         .send({text: 'Hola mundito updateado', completedAt: '2025-5-1'})
         .expect(200);


        expect(body).toEqual({
            id: todo.id,
            text: 'Hola mundito updateado',
            completedAt: '2025-05-01T03:00:00.000Z'
        });
    });

    test('Should return 404 if TODO not found /api/todos/:id', async () => {

        const todoId = 492384923;

        const {body} = await request(testServer.app)
         .put(`/api/todos/${todoId}`)
         .send({text: 'Hola mundito updateado', completedAt: '2025-5-1'})
         .expect(404);

        expect(body).toEqual({ error: `Todo with id ${todoId} not found` });        
    });

    test('Should return an updated TODO where only the date was updated /api/todos/:id', async () => {

        const todo = await prisma.todo.create({data:todo1});

        const {body} = await request(testServer.app)
         .put(`/api/todos/${todo.id}`)
         .send({text: '', completedAt: '2025-5-1'})
         .expect(200);

        expect(body).toEqual({
           id: todo.id,
           text: todo.text,
           completedAt: '2025-05-01T03:00:00.000Z'
        });
    });

    test('Should delete a TODO api/todos/:id', async () => {
        const todo = await prisma.todo.create({data:todo1});
        
        const {body} = await request(testServer.app)
         .delete(`/api/todos/${todo.id}`)
         .expect(200);


        expect(body).toEqual({
            id: todo.id,
            text: todo1.text,
            completedAt: null
        });
    });

    test('Should return 404 if TODO do not exist /api/todos/:id', async () => {

        const todoId = 492384923;

        const {body} = await request(testServer.app)
         .put(`/api/todos/${todoId}`)
         .expect(404);

        expect(body).toEqual({ error: `Todo with id ${todoId} not found` });        
    });
    
});
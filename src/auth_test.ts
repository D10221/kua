import * as Koa from 'koa';
import * as Request from 'supertest';
import {AppContext} from './';
import * as auth from './auth';

function listen(app) {
    return app.listen();
}

async function endPoint(ctx: AppContext, next: () => Promise<any>): Promise<any> {
    ctx.body = "hello";
}

describe('restrict access,...composing', function () {
    it('works', function (done) {
        let app = new Koa();
       
        app.use(auth.lock(endPoint, ['admin', 'user']));
        let request = Request.agent(listen(app));
        
        request.get('/')
            .set('Authentication', JSON.stringify({ name: "admin", password: "admin"}))
            .expect("hello")
            .end((error, r) => {
                if (error) throw (error);
            });

        request.get('/')
            .expect(407)            
            .end((error, r) => {
                if (error) throw (error);                
            })
        
        request.get('/')
            .set('Authentication', JSON.stringify({ name: 'bob', password: 'bob'}))
            .expect(200)
            .expect('hello')
            .end((error, r) => {
                if (error) throw (error);                
            })
        
        request.get('/')
            .set('Authentication', JSON.stringify({ name: 'guest', password: 'guest'}))
            .expect(403)
            .end((error, r) => {
                if (error) throw (error);
                done();
            })
    })
})
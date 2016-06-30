import * as Koa from 'koa';
import * as Request from 'supertest';
import {AppContext} from './kontex';
import * as r from './router';
import k from './kompose';

function listen(app) {
    return app.listen();
}
type AContext = AppContext<any>;

async function hello(ctx: AContext, args): Promise<any> {
    ctx.body = "hello";
}

async function bye(ctx: AContext, args): Promise<any> {
    ctx.body = "bye";
}


describe('routes composing',function(){
    it('works', function(done){

        let app = new Koa();
        app.use(k(r.get('/hello', hello)));
        app.use(k(r.get('/bye', bye)));

        let request = Request.agent(listen(app));

        // request.get('/else')
        // .expect(404)        
        // .end(error=>{
        //     if(error) throw error;            
        // })

        // request.get('/hello')
        // .expect(200)
        // .expect('hello')
        // .end(error=>{
        //     if(error) throw error;
        // });

        request.get('/bye')
        .expect(200)
        .expect('bye')
        .end((error, response) =>{                  
            if(error) throw error;
            done();
        })
    })
})
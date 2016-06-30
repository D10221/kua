import * as Koa from 'koa';
import * as Request from 'supertest';

import {AppContext, AppMiddleware, Auth, User} from './kontex';
import * as router from './router';
import {BasicAuth}from './auth';
import * as users from './user';
import * as testing from './tests';
import Crypto from './crypto';
import {Acl} from "./acl";

function listen(app) {
    return app.listen();
}

async function hello(ctx: AppContext, args): Promise<boolean> {
    let name = 'hello';
    ctx.body = name;
    return true;
}

async function bye(ctx: AppContext, args): Promise<boolean> {
    let name = 'bye';
    ctx.body = name;
    return true;
}

async function admin(ctx: AppContext, args): Promise<boolean> {
    let name = 'admin';
    ctx.body = name;
    return true;
}

describe('kompose auth + routing', () => {
    
    it('goes', (done) => {

        let app = new Koa();
        let crypto = testing.noCrypto;
        let acl = new Acl<User,string>(ctx=> ctx.user, user=> user.roles );
        let auth :Auth<User,string>= new BasicAuth( 
                new users.Service( new testing.UStore(crypto),crypto),
                acl);

        app.use(router.get('/bye', bye));
        app.use(router.get('/hello', hello));
        app.use(auth.lock(router.get('/admin', admin), ['admin']));

        let request = Request(listen(app));

        request.get('/hello')
            .expect('hello')
            .end((error) => {
                if (error) throw error;                
            })

        request.get('/admin')
            .set('Authentication', JSON.stringify({ name: 'admin', password: 'admin' }))
            .expect('admin')
            .end((error) => {
                if (error) throw error;                
            })

        request.get('/admin')
            //.set('Authentication', JSON.stringify({ name: 'admin', password: 'admin' }))
            .expect(407) //Auth Required
            .end((error) => {
                if (error) throw error;                
            })

         request.get('/admin')
            .set('Authentication', JSON.stringify({ name: 'admin', password: 'xxx' }))
            .expect(401) //UnAuthorized : bad credentials 
            .end((error) => {
                if (error) throw error;                
            })

        request.get('/admin')
            .set('Authentication', JSON.stringify({ name: 'bob', password: 'bob' }))
            .expect(403) //Forbidden : bad claims 
            .end((error) => {
                if (error) throw error;                
            })

        request.get('/bye')
            .expect('bye')
            .end((error) => {
                if (error) throw error;
                done();
            })
    })
})
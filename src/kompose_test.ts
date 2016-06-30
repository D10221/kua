import * as Koa from 'koa';
import * as Request from 'supertest';
import {AppContext, AppMiddleware, Auth, UCrypto} from './kontex';
import * as router from './router';
//import {AnyAuth}from './auth';
//import {AuthBasic} from './auth_basic'
import * as testing from './tests';
import * as kua from './';

import User = testing.User;
type TestContext = AppContext<User>;

function listen(app) {
    return app.listen();
}

async function hello(ctx, args): Promise<boolean> {
    let name = 'hello';
    ctx.body = name;
    return true;
}

async function bye(ctx, args): Promise<boolean> {
    let name = 'bye';
    ctx.body = name;
    return true;
}

async function admin(ctx, args): Promise<boolean> {
    let name = 'admin';
    ctx.body = name;
    return true;
}

const matchUser = (crypto: UCrypto) => {
    return (user: User): (user: User) => boolean => {
        return u => {
            return u.name == user.name && crypto.decrypt(u.password) == user.password
        }
    }
}

describe('kompose auth + routing', () => {

    it('goes', (done) => {
                                 
        const auth = kua.create(
            kua.basicAuth(testing.store.find),
            kua.acl<User, string>(ctx => ctx.user, user => user.roles) 
             )

        const app = new Koa();
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
            .set(auth.provider.key, auth.provider.encode({ name: 'admin', password: 'admin' }))
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
            .set(auth.provider.key, auth.provider.encode({ name: 'admin', password: 'xxx' }))
            .expect(401) //UnAuthorized : bad credentials 
            .end((error) => {
                if (error) throw error;
            })

        request.get('/admin')
            .set(auth.provider.key, auth.provider.encode({ name: 'bob', password: 'bob' }))
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
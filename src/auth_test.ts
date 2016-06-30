import * as Koa from 'koa';
import * as Request from 'supertest';
import * as testing from './tests';
import {AppContext, User, Auth, UCrypto } from './kontex';
import {AnyAuth} from './auth';
import {Acl} from './acl';
import * as users from './user';

function listen(app) {
    return app.listen();
}

async function endPoint(ctx: AppContext<User>, next: () => Promise<any>): Promise<any> {
    ctx.body = "hello";
}

const matchUser= (crypto:UCrypto) => {
    return (user: User): (user: User) => boolean => {
        return u => {
            return u.name == user.name &&  crypto.decrypt(u.password) == user.password
        }
    }
}

describe('Auth: restrict access,...composing', function () {
       
    it('works', function (done) {

        const crypto = testing.noCrypto;
        const acl = new Acl<User,string>(ctx=> ctx.user, user=> user.roles );
        const uservice = new users.Service<User>( 
                    new testing.UStore(crypto),
                    matchUser(crypto));
        const auth :Auth<User,string>= new AnyAuth(uservice,acl);

        let app = new Koa().use(
            auth.lock(
                endPoint, ['admin', 'user'])
            );        

        let request = Request.agent(listen(app));

        request.get('/')
            .set('Authentication', JSON.stringify({ name: "admin", password: "admin" }))
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
            .set('Authentication', JSON.stringify({ name: 'bob', password: 'bob' }))
            .expect(200)
            .expect('hello')
            .end((error, r) => {
                if (error) throw (error);
            })

        request.get('/')
            .set('Authentication', JSON.stringify({ name: 'guest', password: 'guest' }))
            .expect(403)
            .end((error, r) => {
                if (error) throw (error);
                done();
            })
    })
})
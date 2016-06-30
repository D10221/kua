import * as Koa from 'koa';
import * as Request from 'supertest';
import * as testing from './tests';
import {AppContext, User, Auth } from './kontex';
import {BasicAuth} from './auth';
import {Acl} from './acl';
import * as users from './user';

function listen(app) {
    return app.listen();
}

async function endPoint(ctx: AppContext, next: () => Promise<any>): Promise<any> {
    ctx.body = "hello";
}


describe('Auth: restrict access,...composing', function () {
       
    it('works', function (done) {

        let crypto = testing.noCrypto;
          let acl = new Acl<User,string>(ctx=> ctx.user, user=> user.roles );
        let auth :Auth<User,string>= new BasicAuth( 
                new users.Service( new testing.UStore(crypto),crypto),
                acl);

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
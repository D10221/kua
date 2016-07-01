import * as Koa from 'koa';
import * as Request from 'supertest';
import {Acl} from './acl';
import * as kua from './';

//
import * as testing from './tests';

function listen(app) {
    return app.listen();
}
import User = testing.User;

async function endPoint(ctx, next: () => Promise<any>): Promise<any> {
    ctx.body = "hello";
}

describe('Auth: restrict access,...composing', function () {

    let users = {
        admin: { name: "admin", password: "admin" },
        bob: { name: 'bob', password: 'bob' },
        guest: { name: 'guest', password: 'guest' }
    }

    it('works', function (done) {

        const auth = kua.create(
            // Find the user based on partial user, ...credentials
            kua.basicAuth(testing.store.find),
            // ACL 
            kua.acl(ctx => ctx.user, user => user.roles));

        let app = new Koa().use(
            auth.lock(
                endPoint, ['admin', 'user'])
        );

        let request = Request.agent(listen(app));

        request.get('/')
            .set(auth.provider.key, auth.provider.encode(users.admin))
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
            .set(auth.provider.key, auth.provider.encode(users.bob))
            .expect(200)
            .expect('hello')
            .end((error, r) => {
                if (error) throw (error);
            })

        request.get('/')
            .set(auth.provider.key, auth.provider.encode(users.guest))
            .expect(403)
            .end((error, r) => {
                if (error) throw (error);
                done();
            })

        // request.get('admin:admin@/something')            
        //     .expect(200)
        //     .end((error, r) => {
        //         if (error) throw (error);
        //         done();
        //     })
    })
})
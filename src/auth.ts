import { AppMiddleware, Next, Auth, AuthProvider, Result, Credential} from './kontex';
import {Acl} from './acl';
import k  from './kompose'
import * as Koa from 'koa';
import * as pathToRegexp from 'path-to-regexp';

// let _getUser = async (ctx)=>{
//         const credentials = ctx.request.headers['authentication'];
//         let result = await this.getUser(credentials);
// }
const skip = async (ctx, next) => { next() };

export class AnyAuth<TUser, TClaim> implements Auth<TUser, TClaim>{

    user = {
        get: (ctx) => { return ctx.user; },
        set: (ctx, value) => { ctx.user = value }
    }

    constructor(
        public provider: AuthProvider<TUser>,
        private acl?: Acl<TUser, TClaim>) {
    }

    credentials = async (ctx: Koa.Context, next: Next): Promise<any> => {
        //const credentials = ctx.request.headers['authentication'];
        let result = await this.provider.credentials(ctx);
        if (result.error) {
            ctx.throw(`user not found: ${result.error.message ? result.error.message : 'Error'}`, 407);
            return;
        }
        ctx['credentials'] = result.value;
        return next();
    }

    authorization = async (ctx: Koa.Context, next: Next): Promise<any> => {
        let result = await this.provider.authenticate(ctx['credentials']);
        if (result.error) {
            ctx.throw(result.error.message ? result.error.message : 'Error', 401);
            return;
        }

        this.user.set(ctx, result.value)

        next();
    }

    /**
     * Requires 'endPoint'... resource to be locked down  
     * 
     * @export
     * @param {AppMiddleware} endPoint
     * @param {Claim[]} [roles] optional claims
     * @returns {AppMiddleware}}
     */
    lock = (endPoint: AppMiddleware, claims?: TClaim[]): AppMiddleware => {
        return k(
            this.credentials,
            this.authorization,
            this.acl ? this.acl.restrict(claims) : skip,
            endPoint);
    }
}






import {AppContext, AppMiddleware, Next,  Auth, AuthProvider,  Result} from './kontex';
import {Acl} from './acl';
import k  from './kompose'
import * as Koa from 'koa';
import * as pathToRegexp from 'path-to-regexp';
  
// let _getUser = async (ctx)=>{
//         const credentials = ctx.request.headers['authentication'];
//         let result = await this.getUser(credentials);
// }
const skip = async (ctx, next)=> { next() };

export class AnyAuth<TUser,TClaim> implements Auth<TUser,TClaim>{

    constructor(
        public provider: AuthProvider<TUser>,       
        private acl?:Acl<TUser,TClaim> ) {
    }
    
    userWare = async (ctx: AppContext<TUser>, next: Next): Promise<any> => {
        //const credentials = ctx.request.headers['authentication'];
        let result = await this.provider.fromContext(ctx);
        if (result.error) {
            ctx.throw(`user not found: ${result.error.message ? result.error.message : 'Error'}`, 407);
            return;
        }
        ctx.user = result.value;
        return next();
    }

    authWare = async (ctx: AppContext<TUser>, next: Next): Promise<any> => {
        let result = await this.provider.authenticate(ctx.user);
        if (result.error) {
            ctx.throw(result.error.message ? result.error.message : 'Error', 401);
            return;
        }
        // replace with full user 
        ctx.user = result.value;
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
        return k( this.userWare,
            this.authWare,
            this.acl ? this.acl.restrict(claims) : skip ,
            endPoint);
    }
}






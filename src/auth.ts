import {AppContext, AppMiddleware, Next,  Auth, AuthProvider,  Result, Credential} from './kontex';
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
    
    credentials = async (ctx: AppContext<TUser>, next: Next): Promise<any> => {
        //const credentials = ctx.request.headers['authentication'];
        let result = await this.provider.fromContext(ctx);
        if (result.error) {
            ctx.throw(`user not found: ${result.error.message ? result.error.message : 'Error'}`, 407);
            return;
        }
        (ctx as any).credentials = result.value;
        return next();
    }

    authorization = async (ctx: AppContext<TUser>, next: Next): Promise<any> => {
        const c = (ctx as any).credentials as Credential;
        let result = await this.provider.authenticate(c);
        if (result.error) {
            ctx.throw(result.error.message ? result.error.message : 'Error', 401);
            return;
        }
        
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
        return k( 
            this.credentials,
            this.authorization,
            this.acl ? this.acl.restrict(claims) : skip ,
            endPoint);
    }
}






import {AppContext, AppMiddleware, Next, Result, User,IUserService, Auth} from './kontex';


import * as Koa from 'koa';
const compose = require('koa-compose');
import * as pathToRegexp from 'path-to-regexp';


export class BasicAuth implements Auth {

    constructor(private usvc: IUserService ) {
        
    }

    userWare = (ctx: AppContext, next: Next): Promise<any> => {
        const credentials = ctx.request.headers['authentication'];
        let result = this.usvc.getUser(credentials);
        if (result.error) {
            ctx.throw(`user not found: ${result.error.message ? result.error.message : 'Error'}`, 407);
            return;
        }
        ctx.user = result.value;
        return next();
    }

    authWare = async (ctx: AppContext, next: Next): Promise<any> => {
        let result = this.usvc.authenticate(ctx.user);
        if (result.error) {
            ctx.throw(result.error.message ? result.error.message : 'Error', 401);
            return;
        }
        // replace with full user 
        ctx.user = result.value;
        next();
    }

    /**
     *  Requires UserWare  
     * @export
     * @param {Role[]} roles
     * @returns {AppMiddleware}
     */
    restrict= (claims: string[]): AppMiddleware => {
        const auth = this;
        return async function (ctx: AppContext, next: () => Promise<any>) {
            if (!auth.usvc.hasClaim(ctx.user, claims)) {
                ctx.status = 403;
                return;
            }
            return next();
        }
    }

    /**
     *Requires 'endPoint' 
     * 
     * @export
     * @param {AppMiddleware} endPoint
     * @param {Claim[]} [roles] optional claims
     * @returns {AppMiddleware}}
     */
    lock = (endPoint: AppMiddleware, claims?: string[]): AppMiddleware => {
        return compose([
            this.userWare,
            this.authWare,
            this.restrict(claims),
            endPoint
        ]);
    }
}






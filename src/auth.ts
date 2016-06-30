import {AppContext, AppMiddleware, Next,  IUserService, Auth} from './kontex';
import {Acl} from './acl';

import * as Koa from 'koa';
const compose = require('koa-compose');
import * as pathToRegexp from 'path-to-regexp';


export class BasicAuth<TUser,TClaim> implements Auth<TUser,TClaim>{

    constructor(private usvc: IUserService, private acl:Acl<TUser,TClaim> ) {
        
    }

    userWare = async (ctx: AppContext, next: Next): Promise<any> => {
        const credentials = ctx.request.headers['authentication'];
        let result = await this.usvc.getUser(credentials);
        if (result.error) {
            ctx.throw(`user not found: ${result.error.message ? result.error.message : 'Error'}`, 407);
            return;
        }
        ctx.user = result.value;
        return next();
    }

    authWare = async (ctx: AppContext, next: Next): Promise<any> => {
        let result = await this.usvc.authenticate(ctx.user);
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
        return compose([
            this.userWare,
            this.authWare,
            this.acl.restrict(claims),
            endPoint
        ]);
    }
}






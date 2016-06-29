import {AppContext, AppMiddleware, Next, Result} from './';
import {getUser, authenticate, Claim, hasClaim} from './user';

import * as Koa from 'koa';
const compose = require('koa-compose');
import * as pathToRegexp from 'path-to-regexp';


export async function userWare(ctx: AppContext, next: Next): Promise<any> {

    let result = getUser(ctx.request.headers['authentication']);
    if (result.error) {
        ctx.throw(`user not found: ${result.error.message ? result.error.message : 'Error'}`, 407);
        return;
    }
    ctx.user = result.value;
    return next();
}

export async function authWare(ctx: AppContext, next: Next): Promise<any> {
    let result = authenticate(ctx.user);
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
export function restrict(claims: Claim[]): AppMiddleware {
    //
    return async function (ctx: AppContext, next: () => Promise<any>) {        
        if (!hasClaim(ctx.user, claims)) {
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
export function lock(endPoint,claims?: Claim[]){             
        return compose([
            userWare, 
            authWare,
            restrict(claims),
            endPoint
        ]);
}



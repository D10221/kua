import * as Koa from 'koa';
import { AppMiddleware} from './kontex';

export interface ClaimProvider<TUser, TClaim> {
    //
    getUser: (ctx) => TUser,
    //
    getClaims: (u: TUser) => TClaim[],
    // 
    claimMatch?: (userClaims: TClaim[], requiredClaims: TClaim[]) => boolean
}


export class Acl<TUser, TClaim> {

    /**
     * Creates an instance of Acl.
     * 
     * @param {(ctx)=> TUser} getUser how to get the USER from the CTX
     * @param {(u:TUser)=> TClaim[]} getClaims , how to get The Claims from the User,
     * @param {(r:TClaim)=> boolean} [claimMatch] ,optional:  How to Check user provided claimsagainst required claims, returns claim found
     */
    constructor(public provider: ClaimProvider<TUser, TClaim>) {

        provider.claimMatch = provider.claimMatch || ((uclaims, required) => {
            for (let uclaim of uclaims) {
                for (let r of required) {
                    if (r == uclaim) {
                        return true;
                    }
                }
            }
            return false
        })
    }
    /**
     * does the current user in current context have required claims: 
     * if no required claims  , then  true
     * if no claims then false
     */
    hasClaim = (ctx: Koa.Context, required: TClaim[]): boolean => {
        let user = this.provider.getUser(ctx);
        let claims = this.provider.getClaims(user);
        if (!Array.isArray(required)) return true;
        return (user && claims) ? this.provider.claimMatch(claims, required) : false;
    }
    /**
    *  Requires UserWare  
    * @export
    * @param {Role[]} roles
    * @returns {AppMiddleware}
    */
    restrict = (required: TClaim[]): AppMiddleware => {
        const auth = this;
        return async function (ctx: Koa.Context, next: () => Promise<any>) {
            if (!auth.hasClaim(ctx, required)) {
                ctx.status = 403;
                return;
            }
            return next();
        }
    }
} 
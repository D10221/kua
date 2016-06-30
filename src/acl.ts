import {AppContext, AppMiddleware, Next, Users, Auth} from './kontex';

export class Acl<TUser, TClaim> {

    /**
     * Creates an instance of Acl.
     * 
     * @param {(ctx)=> TUser} getUser how to get the USER from the CTX
     * @param {(u:TUser)=> TClaim[]} getClaims , how to get The Claims from the User,
     * @param {(r:TClaim)=> boolean} [claimMatch] ,optional:  How to Check user provided claimsagainst required claims, returns claim found
     */
    constructor(
        //
        private getUser: (ctx) => TUser,
        //
        private getClaims: (u: TUser) => TClaim[],
        // 
        private claimMatch?: (userClaims: TClaim[], requiredClaims: TClaim[]) => boolean) {
        
        this.claimMatch = this.claimMatch || ((uclaims, required) => {
            for (let uclaim of uclaims) {
                for (let r of required) {
                    if (r == uclaim) {
                        return true;
                    }
                }
            } return false
        })
    }
    /**
     * does the current user in current context have required claims: 
     * if no required claims  , then  true
     * if no claims then false
     */
    hasClaim = (ctx: AppContext<TUser>, required: TClaim[]): boolean => {
        let user = this.getUser(ctx);
        let claims = this.getClaims(user);
        if (!Array.isArray(required)) return true;
        if (user && claims) {
            for (let claim of claims) {
                for (let userClaim of required) {
                    if (userClaim == claim) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /**
    *  Requires UserWare  
    * @export
    * @param {Role[]} roles
    * @returns {AppMiddleware}
    */
    restrict = (required: TClaim[]): AppMiddleware => {
        const auth = this;
        return async function (ctx: AppContext<TUser>, next: () => Promise<any>) {
            if (!auth.hasClaim(ctx, required)) {
                ctx.status = 403;
                return;
            }
            return next();
        }
    }
}
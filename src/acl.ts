import {AppContext, AppMiddleware, Next,  IUserService, Auth} from './kontex';

export class Acl<TUser,TClaim> {

    constructor(private getUser:(ctx)=> TUser ,private getClaims: (u:TUser)=> TClaim[]){

    }

    hasClaim = (ctx:AppContext, required: TClaim[]): boolean => {
        let user = this.getUser(ctx);
        let claims = this.getClaims(user);
        if (!Array.isArray(required)) return true;
        if (user && claims) {
            for (let role of claims) {
                for (let r of required) {
                    if (r == role) {
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
    restrict= (required: TClaim[]): AppMiddleware => {
        const auth = this;
        return async function (ctx: AppContext, next: () => Promise<any>) {
            if (!auth.hasClaim(ctx, required)) {
                ctx.status = 403;
                return;
            }
            return next();
        }
    }
}
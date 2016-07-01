import {AnyAuth} from './auth';
import {AuthBasic} from './auth_basic';
import {Acl} from './acl';
import {Credential} from './kontex';
import * as krouter from './router'
export {Credential} from './kontex';

/**
 * Main Fty...  
 * @export
 * @template TUser :  usert Type 
 * @template TClaim : Claim Type 
 * @param {AuthProvider} provider : Auth Provider , ex: {BasicAuth}
 * @param {Acl} [acl]
 * @returns
 */
export function create<TUser, TClaim>(provider, acl?) {       
    return new AnyAuth(provider,acl);
}

/**
 * 
 * Basic Auth Provider  
 * @export
 * @template TUser user type 
 * @param {(user: TUser) => Promise<TUser>} find 
 * @returns
 */
export function basicAuth<TUser>(find: (credential: Credential) => Promise<TUser>) {
    return new AuthBasic<TUser>(find);
}

/**
 * 
 *  ACL fty 
 * @export
 * @template U user type
 * @template C Claim Type
 * @param {(ctx) => U} getUser : should gets user from context 
 * @param {(u: U) => C[]} getClaims should get claims from user 
 * @param {(userClaims: C[], requiredClaims: C[]) => boolean} [claimMatch] : how to check , compare claims, defaults to..claim exists in claims  
 * @returns {Acl<U, C>}
 */
export function acl<TUser, TClaim>(
    // how to get user from context 
    getUser: (ctx) => TUser,
    // how to  get claims from user 
    getClaims: (u: TUser) => TClaim[],
    // Optional : defaults to <claim> in user.<claims> 
    claimMatch?: (userClaims: TClaim[], requiredClaims: TClaim[]) => boolean): Acl<TUser, TClaim> {

    return new Acl({ getUser: getUser, getClaims, claimMatch });
}

export const router = krouter; 


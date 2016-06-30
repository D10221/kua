import {Result, User, Users, UserStore, UCrypto, Store, AppContext } from './kontex';
import * as Debug from 'debug';
const debug = Debug('kua:auth')

function TryParse<T>(json: string): Result<T> {

    let value = null;
    let error = null;
    try {
        value = JSON.parse(json)
    } catch (e) {
        debug(`users: Parse: ${json}, Error: ${e.message}`)
        error = e;
    }
    return { error: error, value: value };
}

export class Service<TUser> implements Users<TUser> {

    constructor(
            private store: Store<TUser>,
            private matchUser : (user: TUser)=> (user: TUser) => boolean) {    
    }

    async getUser(ctx: AppContext<TUser>): Promise<Result<TUser>> {
         const credentials = ctx.request.headers['authentication'];
        return TryParse<TUser>(credentials);
    }
    
    authenticate = async (user: TUser): Promise<Result<TUser>> => {
        let value = null;
        let error = null;
        try {
            value = await this.store.find(this.matchUser(user));
            if (!value) { throw new Error('User Not Found') };
        } catch (e) {
            error = e;
        }
        return { value: value, error: error };
    }
}
import {Result,   UCrypto, Store, AppContext, AuthProvider } from './kontex';
import * as Debug from 'debug';
const debug = Debug('kua:auth')

export class AuthBasic<TUser> implements AuthProvider<TUser> {

    constructor(        
        private find: (user: TUser) => Promise<TUser> ) {
    }
   
    decode<T>(json: string): Result<T> {
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

    encode(u:TUser) :string {
        return !u ? '' : JSON.stringify(u);
    }
    
    key = 'authentication';

    fromContext = async (ctx: AppContext<TUser>): Promise<Result<TUser>> => {
        let credentials = ctx.request.headers[this.key];
        return this.decode<TUser>(credentials);
    }

    authenticate = async (user: TUser): Promise<Result<TUser>> => {
        let value = null;
        let error = null;
        try {
            value = await this.find(user);
            if (!value) { throw new Error('User Not Found') };
        } catch (e) {
            error = e;
        }
        return { value: value, error: error };
    }
}
import {Result, User, IUserService, UserStore, Crypto } from './kontex';

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

export class Service implements IUserService {

    constructor(private store: UserStore, private crypto: Crypto) {
        
    }

    getUser(credentials: string): Promise<Result<User>> {
        return Promise.resolve(TryParse<User>(credentials));
    }

    hasClaim = (user: User, roles: string[]): boolean => {
        if (!Array.isArray(roles)) return true;
        if (user && user.roles) {
            for (let role of user.roles) {
                for (let r of roles) {
                    if (r == role) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private matchUser=(user: User): (user: User) => boolean => {
        return u => {
            return u.name == user.name && this.crypto.decrypt(u.password) == user.password
        }
    }

    authenticate = async (user: User): Promise<Result<User>> => {
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
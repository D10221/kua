import {Result} from './';

export interface User {
    name: string;
    password: string;
    email?: string;
    roles?: string[];
}

export type Claim = 'admin' | 'user' | 'guest';

export function TryParse<T>(json: string): Result<T> {

    let value = null;
    let error = null;
    try {
        value = JSON.parse(json)
    } catch (e) {
        error = e;
    }
    return { error: error, value: value };
}

export function getUser(credentials: string): Result<User> {
    return TryParse<User>(credentials);
}

const users: User[] = [
    { name: 'admin', password: 'admin',email:'admin@mail', roles: ['admin'] },
    { name: 'bob', password: 'bob', email:'bob@mail', roles: ['user'] },
    { name: 'guest', password: 'guest' }
]
//const roles = ['admin', 'user'];

export const hasClaim = (user: User, roles: string[]): boolean => {
    if(!Array.isArray(roles)) return true;    
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

function matchUser(user:User): (user:User) => boolean {
    return u => {
        return u.name == user.name && u.password == user.password
    }
}

export function authenticate(user: User): Result<User> {
    let value = null;
    let error = null;
    try {
        value = users.find(matchUser(user));
        if(!value){ throw new Error('User Not Found')};        
    } catch (e) {
        error = e;
    }
    return { value: value, error: error };
}
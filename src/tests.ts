import {UCrypto} from './kontex';
import './auth_test';
import './route_test';
import './kompose_test';

export class UStore {

    constructor(private crypto: UCrypto) {
        this.users = [
            { name: 'admin', password: 'admin', email: 'admin@mail', roles: ['admin'] },
            { name: 'bob', password: 'bob', email: 'bob@mail', roles: ['user'] },
            { name: 'guest', password: 'guest' }
        ]
            .map(u => {
                u.password = crypto.encrypt(u.password)
                return u
            })
    }

    users: User[];

    find= (user: User): Promise<User> => {
        const users = this.users;
        return new Promise((resolve, reject) => {
            try {
                resolve(
                    users.find(current => {
                    return current.name == user.name && this.crypto.decrypt(current.password) == user.password
                }));
            } catch (error) {
                reject(error);
            }
        })
    }
}

export const noCrypto: UCrypto = {

    encrypt(x: string): string {
        return x;
    },

    decrypt(x: string): string {
        return x;
    }
}

export const store =  new UStore(noCrypto);

export interface User {
    name: string;
    password: string;
    email?: string;
    roles?: string[];
}


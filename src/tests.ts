import {User, Crypto} from './kontex';
import './auth_test';
import './route_test';
import './kompose_test';

export class UStore {

    constructor(crypto: Crypto) {
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

    find = (predicate) => {
        return this.users.find(predicate)
    }
}

export const noCrypto = {

    encrypt(x: string): string {
        return x;
    },

    decrypt(x: string): string {
        return x;
    }
}

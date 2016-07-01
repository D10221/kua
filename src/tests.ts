import {Credential} from './kontex';
import './auth_test';
import './route_test';
import './kompose_test';

export interface UCrypto {
    encrypt(i:string) : string ;
    decrypt(s:string) : string ; 
}

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

    find= (credential:Credential ): Promise<User> => {
        const users = this.users;
        return new Promise((resolve, reject) => {
            try {
                const name = credential.name;
                const pass = credential.password;
                const found = users.find(current => {
                    return current.name == name && this.crypto.decrypt(current.password) == credential.password
                })
                resolve(found);
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


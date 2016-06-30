import * as Koa from 'koa';

export interface AppContext extends Koa.Context {
    user: User;
}

export type Next = () => Promise<any>;

export interface Result<T> { value: T, error: Error };

export type AppMiddleware = (ctx: AppContext, next: () => Promise<any>) => Promise<any>;

export interface User {
    name: string;
    password: string;
    email?: string;
    roles?: string[];
}

export interface IUserService {
        getUser: (credentialsa: string) => Promise<Result<User>>;
        authenticate: (u: User) => Promise<Result<User>>;
       // hasClaim: (u: User, claims: string[]) => boolean;
}

export interface UserStore {
    find(predicate: (u:User)=> boolean) : Promise<User>;
}

export interface Auth<TUser,TClaim>{
    lock (endPoint: AppMiddleware, claims?: TClaim[]) : AppMiddleware
}

export interface Crypto {
    encrypt(i:string) : string ;
    decrypt(s:string) : string ; 
}
import * as Koa from 'koa';

export interface AppContext<TUser> extends Koa.Context {
    user: TUser;
}

export type Next = () => Promise<any>;

export interface Result<T> { value: T, error: Error };

export type AppMiddleware = <TUser>(ctx: AppContext<TUser>, next: () => Promise<any>) => Promise<any>;

export interface User {
    name: string;
    password: string;
    email?: string;
    roles?: string[];
}

export interface Users<TUser> {
        //getUser: (credentialsa: string) => Promise<Result<User>>;
        getUser(ctx:AppContext<TUser>): Promise<Result<TUser>>
        authenticate: (u: TUser) => Promise<Result<TUser>>;
       // hasClaim: (u: User, claims: string[]) => boolean;
}

export interface UserStore {
    find(predicate: (u:User)=> boolean) : Promise<User>;
}

export interface Auth<TUser,TClaim>{
    lock (endPoint: AppMiddleware, claims?: TClaim[]) : AppMiddleware
}

export interface UCrypto {
    encrypt(i:string) : string ;
    decrypt(s:string) : string ; 
}

export interface Store<TUser>{
    find(predicate: (u:TUser)=> boolean) : Promise<TUser>;
}
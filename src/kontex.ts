import * as Koa from 'koa';

export interface AppContext<TUser> extends Koa.Context {    
    user: TUser;
}

export type Next = () => Promise<any>;

export interface Result<T> { value: T, error: Error };

export type AppMiddleware = <TUser>(ctx: AppContext<TUser>, next: () => Promise<any>) => Promise<any>;

export interface AuthProvider<TUser> {
        fromContext(ctx:AppContext<TUser>): Promise<Result<Credential>>
        authenticate: (c: Credential) => Promise<Result<TUser>>;
        decode<T>(json: string): Result<T>;
        encode(u:Credential) :string;      
        key: string; 
}

export interface Auth<TUser,TClaim>{
    lock (endPoint: AppMiddleware, claims?: TClaim[]) : AppMiddleware
}

export interface UCrypto {
    encrypt(i:string) : string ;
    decrypt(s:string) : string ; 
}

export interface Credential {
    name?: string;
    password?: string;
}
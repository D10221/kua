import * as Koa from 'koa';

export type Next = () => Promise<any>;

export interface Result<T> { value: T, error: Error };

export type AppMiddleware = <TUser>(ctx: Koa.Context, next: () => Promise<any>) => Promise<any>;

export interface AuthProvider<TUser> {
        credentials(ctx:Koa.Context): Promise<Result<Credential>>
        authenticate: (c: Credential) => Promise<Result<TUser>>;
        encode(u:Credential) :string;      
        key: string; 
}

export interface Auth<TUser,TClaim>{
    lock (endPoint: AppMiddleware, claims?: TClaim[]) : AppMiddleware
}



export interface Credential {
    name?: string;
    password?: string;
}
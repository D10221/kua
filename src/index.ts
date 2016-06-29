import * as Koa from 'koa';
import {User} from './user'

export interface AppContext extends Koa.Context {
    user: User;
}

export type Next = () => Promise<any>;

export type Result<T> = { value: T, error: Error };

export type AppMiddleware = (ctx: AppContext, next: () => Promise<any>) => Promise<any>;
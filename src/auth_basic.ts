import * as assert from 'assert';
import * as Koa from 'koa';
import {Result, AuthProvider ,Credential } from './kontex';
import * as Debug from 'debug';
const debug = Debug('kua:auth')

let regex = /Basic\s+(.*)/i;

export class AuthBasic<TUser> implements AuthProvider<TUser> {

    constructor(
        private find: (c: Credential) => Promise<TUser>) {
    }

    decode(header: string): Result<Credential> {
        let value = null;
        let error = null;
        try {
            let r = regex.exec(header);            
            let auth = new Buffer(r[1], 'Base64').toString();            
            let parts = /^([^:]*):(.*)$/.exec(auth);            
            value = {name: parts[1], password: parts[2]} ;
        } catch (e) {
            debug(`users: Parse: ${header}, Error: ${e.message}`)
            error = e;
        }
        return { error: error, value: value };
    }

    encode(c:Credential): string {  
        assert(c);                      
        return `Basic ${new Buffer(`${c.name}:${c.password}`).toString('Base64')}`;
    }

    key = 'authentication';

    credentials = async (ctx: Koa.Context): Promise<Result<Credential>> => {        
            return this.decode(ctx.request.headers[this.key]);            
    }

    authenticate = async (c: Credential): Promise<Result<TUser>> => {
        let value = null;
        let error = null;
        try {
            value = await this.find(c);
            if (!value) { throw new Error('User Not Found') };
        } catch (e) {
            error = e;
        }
        return { value: value, error: error };
    }
}

export interface Credentials {
    name: string;
    password: string;
}
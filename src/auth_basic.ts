import * as assert from 'assert';
import * as Koa from 'koa';
import {Result, AuthProvider, Credential } from './kontex';
import * as Debug from 'debug';
const debug = Debug('kua:auth')


export class AuthBasic<TUser> implements AuthProvider<TUser> {

    constructor(
        private find: (c: Credential) => Promise<TUser>) {
    }

    split(auth: string): Result<Credential> {
        let value = null;
        let error = null;
        try {
            let parts = /^([^:]*):(.*)$/.exec(auth);
            value = { name: parts[1], password: parts[2] };
        } catch (error) {
            debug(`users: Parse: ${auth}, Error: ${error.message}`)
            error = error;
        }
        return { error: error, value: value };
    }

    encode(c: Credential): string {
        assert(c);
        return `Basic ${new Buffer(`${c.name}:${c.password}`).toString('Base64')}`;
    }

    key = 'authentication';
    
    private fromHeaders(header) {
        try {
            let r = /Basic\s+(.*)/i.exec(header);
            return new Buffer(r[1], 'Base64').toString();
        } catch (error) {
            debug('Bad headers')
            return null
        }
    }

    private fromUrl(url) {
        try {
            const m = /^(.*)@.*/.exec(url);
            return m ? m[1] : null;
        } catch (error) {
            debug('bad url auth');
            return null;
        }
    }

    credentials = async (ctx: Koa.Context): Promise<Result<Credential>> => {
        const x =  this.fromUrl(ctx.url) || this.fromHeaders(ctx.request.headers[this.key]);
        if (!x) {
            return { value: null, error: new Error('no auth') };
        }
        debug(`auth: ${x}`);
        return this.split(x);
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
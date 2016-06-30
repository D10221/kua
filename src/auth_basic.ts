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
        let s = !c ? '' : ((c.name ||'') +':'+ (c.password ||''));                
        return `Basic ${new Buffer(s).toString('Base64')}`;
    }

    key = 'authentication';

    fromContext = async (ctx: Koa.Context): Promise<Result<Credential>> => {        
            return this.decode(
                ctx.request.headers[this.key]
                );            
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

function auth(getUser: (name: string, pass: string) => Promise<Credential>
) {

    let regex = /Basic\s+(.*)/i;

    return async function (header) {

        let r = regex.exec(header);
        if (!r) throw (401);

        let auth = new Buffer(r[1], 'base64').toString();
        if (!auth) throw (401);

        let parts = /^([^:]*):(.*)$/.exec(auth);

        let user = await getUser(parts[1], parts[2]);
        if (!user) throw (401);

        // (ctx.request as any).user = user;
        // next();
    }
}
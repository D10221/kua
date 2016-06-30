import * as Koa from 'koa';
const compose = require('koa-compose');

import { AppMiddleware} from './kontex';

export default function k(...middleware:AppMiddleware[] ):  AppMiddleware {
    return compose(middleware);
};


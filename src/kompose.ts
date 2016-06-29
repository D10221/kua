import * as Koa from 'koa';
const compose = require('koa-compose');

import {AppContext, AppMiddleware} from './';

export default function k(...middleware:AppMiddleware[] ):  AppMiddleware {
    return compose(middleware);
};


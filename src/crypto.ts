import * as path from 'path';
import * as crypto from 'crypto';

const algorithm = 'aes-256-ctr';

export default class Crypto {

   constructor(private config:{ secret: string }) {

  }

  encrypt=(text: string): string => {
    var cipher = crypto.createCipher(algorithm, this.config.secret);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  }

  decrypt = (text: string): string => {
    var decipher = crypto.createDecipher(algorithm, this.config.secret);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  } 
}
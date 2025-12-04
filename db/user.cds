using {cuid,managed} from '@sap/cds/common';

namespace my.user;

entity User : cuid, managed {
    name : String(100);
    @assert.unique
    email : String(200);
    password : String(50);
    refreshToken:String(200);
}
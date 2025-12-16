using {cuid,managed} from '@sap/cds/common';

namespace my.user;

entity User : cuid, managed {
    name : String(100) @mandatory;
    @assert.unique
    email : String(200) @mandatory;
    password : String(50) @mandatory;
    refreshToken:String(200);
} 
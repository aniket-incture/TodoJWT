using {cuid,managed} from '@sap/cds/common';
using my.user as db from './user';

namespace my.todo;

entity Todo : cuid, managed {
    title : String @mandatory;
    isDone : Boolean; 
    owner : Association to db.User;
}
 
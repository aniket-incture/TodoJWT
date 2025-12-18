using {cuid,managed} from '@sap/cds/common';

namespace my.todo;

entity Todo : cuid, managed {
    title : String @mandatory;
    isDone : Boolean; 
}
 
 
using {my.todo as todo} from '../db/todo';

service todoService {

  @requires: 'authenticated-user'
  entity Todos as projection on todo.Todo;
   
}
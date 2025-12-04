using {my.todo as todo} from '../db/todo';

service todoService {

  entity Todos as projection on todo.Todo;

}
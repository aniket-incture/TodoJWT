using {my.user as user} from '../db/user';

service userService {
@readonly
  entity Users as projection on user.User;

}
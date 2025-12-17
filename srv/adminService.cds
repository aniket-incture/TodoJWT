using {my.user as user} from '../db/user';

service adminService{
    entity Users as project on user.User
}
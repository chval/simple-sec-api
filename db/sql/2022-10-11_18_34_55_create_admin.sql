create table user_admin (
    id integer primary key autoincrement,
    user_id integer references user(id)
);

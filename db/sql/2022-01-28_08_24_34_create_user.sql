create table user (
    id integer primary key autoincrement,
    first_name varchar(255),
    last_name varchar(255)
);

create table user_login (
    id integer primary key autoincrement,
    user_id integer references user(id),
    email varchar(255) not null unique,
    password character(385)
);

create table user_login_history (
    id integer primary key autoincrement,
    user_id integer references user(id),
    method varchar(255),
    login_at varchar(255) default current_timestamp not null,
    user_agent varchar(255),
    ip_address varchar(255),
    success integer not null default 0 check (success = 0 or success = 1)
);

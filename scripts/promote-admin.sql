-- Run this manually in the Vercel Postgres query console (Storage > your
-- database > Query) after a user has signed up normally through /signup,
-- since the public signup form intentionally only allows "client" or
-- "provider" — admin accounts are never self-served.
UPDATE users SET role = 'admin' WHERE email = 'REPLACE_WITH_EMAIL';

# TK - NEWS

An API with user posts and data for a future frontend P2P forum website project

## To View This Project

Live API available [here](https://tk-news.onrender.com/)

URL: [www.tk-news.onrender.com/](https://tk-news.onrender.com/)

To view locally clone or download repository then navigate into directory where it is saved and follow below steps..

## Set Up

For security reasons, environment files are gitignored.
In order to set up the environment, the cloned user will need to set up two files named:

### `.env.test`

### `.env.development`

Within these files insert the following

### `PGDATABASE=<database_name_here>`

the database names can be found in **./db/setup.sql**

### `npm install`

Install required packages.

### `npm run seed `

To run the API locally

## API Endpoints

### `GET /api`

Responds with a json representation of all the available endpoints of the api with additional information on each

### `GET /api/topics`

Responds with an array of all topics

### `GET /api/articles`

Responds with an array of all articles

### `GET /api/articles/:article_id`

Responds with the article object with the corresponding article id

### `GET /api/articles/:article_id/comments`

Responds with the comments from a specific article

### `GET /api/users`

Responds with an array of all users

### `POST /api/articles/:article_id/comments`

Inserts the comment provided into the database and responds with the inserted comment

### `PATCH /api/articles/:article_id`

Adds the number of votes provided in the body to the specified article

### `DELETE /api/comments/:comment_id`

Deletes the specified comment and responds with no content

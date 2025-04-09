# REST API for Books

## Installation

1. Clone the repository
2. Install dependencies using `npm install`
3. Create a `.env` file in the root directory and add the following variables:
4. Create a db named "db1" in your postgres host

```
DB_HOST=localhost
DB_USER=postgres
DB_PASS=example
DB_PORT=5432
DB_NAME=db1
JWT_SECRET=your_jwt_secret
```

4.  Run the server using `npm run dev`

## Endpoints

### Signup

POST /signup

Parameters:

- email (string): The email address of the user
- password (string): The password of the user

Response:

- 201 (Created): If the user is successfully created
- 400 (Bad Request): If the email or password is missing

### Login

POST /login

Parameters:

- email (string): The email address of the user
- password (string): The password of the user

Response:

- 200 (OK): If the user is successfully logged in
- 400 (Bad Request): If the email or password is missing
- 401 (Unauthorized): If the email or password is incorrect

### Create Book

POST /books

Parameters:

- title (string): The title of the book
- author (string): The author of the book
- category (string): The category of the book
- price (number): The price of the book
- rating (number): The rating of the book
- publishedDate (date): The date the book was published

Response:

- 201 (Created): If the book is successfully created
- 400 (Bad Request): If any of the required fields are missing

### Get All Books

GET /books

Parameters:

- author (string): The author of the books
- category (string): The category of the books
- rating (number): The minimum rating of the books
- title (string): The title of the books

Response:

- 200 (OK): If the books are successfully retrieved

### Get Book by ID

GET /books/:id

Response:

- 200 (OK): If the book is successfully retrieved
- 404 (Not Found): If the book is not found

### Update Book by ID

PUT /books/:id

Parameters:

- title (string): The title of the book
- author (string): The author of the book
- category (string): The category of the book
- price (number): The price of the book
- rating (number): The rating of the book
- publishedDate (date): The date the book was published

Response:

- 200 (OK): If the book is successfully updated
- 404 (Not Found): If the book is not found

### Delete Book by ID

DELETE /books/:id

Response:

- 200 (OK): If the book is successfully deleted (soft delete)
- 404 (Not Found): If the book is not found (soft delete)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

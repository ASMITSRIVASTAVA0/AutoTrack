# User Registration API

## Endpoint

`POST /users/register`

## Description

Registers a new user in the system. This endpoint validates the input, hashes the password, creates the user, and returns an authentication token along with the user data.

## Request Body

Send a JSON object with the following structure:

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "yourpassword"
}
```

### Field Requirements

- `fullname.firstname` (string, required): Minimum 3 characters.
- `fullname.lastname` (string, optional): Minimum 3 characters if provided.
- `email` (string, required): Must be a valid email address, minimum 5 characters.
- `password` (string, required): Minimum 6 characters.

## Responses

### Success

- **Status Code:** `201 Created`
- **Body:**
  ```json
  {
    "token": "<token>",
    "user": {
      "_id": "<user_id>",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com",
      "socketId": null
    }
  }
  ```

### Validation Error

- **Status Code:** `400 Bad Request`
- **Body:**
  ```json
  {
    "errors": [
      {
        "msg": "First name must be 3 character long",
        "param": "fullname.firstname",
        "location": "body"
      }
      // ...other errors
    ]
  }
  ```

### Missing Fields

- **Status Code:** `500 Internal Server Error`
- **Body:**
  ```json
  {
    "message": "All fields re required"
  }
  ```

## Example Request

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {"firstname": "John", "lastname": "Doe"},
    "email": "john.doe@example.com",
    "password": "yourpassword"
  }'
```

---

# User Login API

## Endpoint

`POST /users/login`

## Description

Authenticates a user with email and password. Returns an authentication token and user data if credentials are valid.

## Request Body

Send a JSON object with the following structure:

```json
{
  "email": "john.doe@example.com",
  "password": "yourpassword"
}
```

### Field Requirements

- `email` (string, required): Must be a valid email address.
- `password` (string, required): Minimum 6 characters.

## Responses

### Success

- **Status Code:** `200 OK`
- **Body:**
  ```json
  {
    "token": "<token>",
    "user": {
      "_id": "<user_id>",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com",
      "socketId": null
    }
  }
  ```

### Validation Error

- **Status Code:** `400 Bad Request`
- **Body:**
  ```json
  {
    "errors": [
      {
        "msg": "Invalid Email",
        "param": "email",
        "location": "body"
      }
      // ...other errors
    ]
  }
  ```

### Invalid Credentials

- **Status Code:** `401 Unauthorized`
- **Body:**
  ```json
  {
    "message": "Invalid Email or Password"
  }
  ```

## Example Request

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "yourpassword"
  }'
```

---

# User Profile API

## Endpoint

`GET /users/profile`

## Description

Returns the authenticated user's profile information. Requires a valid JWT token in the `Authorization` header as `Bearer <token>` or as a `token` cookie.

## Request Headers

- `Authorization: Bearer <token>` (or send token as a cookie)

## Responses

### Success

- **Status Code:** `200 OK`
- **Body:**
  ```json
  {
    "_id": "<user_id>",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null
  }
  ```

### Unauthorized

- **Status Code:** `401 Unauthorized`
- **Body:**
  ```json
  {
    "message": "Unauthorized"
  }
  ```

## Example Request

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer <token>"
```

---

# User Logout API

## Endpoint

`GET /users/logout`

## Description

Logs out the authenticated user by blacklisting the current JWT token and clearing the authentication cookie.

## Request Headers

- `Authorization: Bearer <token>` (or send token as a cookie)

## Responses

### Success

- **Status Code:** `200 OK`
- **Body:**
  ```json
  {
    "message": "Logged-out"
  }
  ```

### Unauthorized

- **Status Code:** `401 Unauthorized`
- **Body:**
  ```json
  {
    "message": "Unauthorized"
  }
  ```

## Example Request

```bash
curl -X GET http://localhost:3000/users/logout \
  -H "Authorization: Bearer <token>"
```
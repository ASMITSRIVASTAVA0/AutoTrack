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
    "token": "<_token>",
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
curl -X POST http://localhost:4000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {"firstname": "John", "lastname": "Doe"},
    "email": "john.doe@example.com",
    "password": "yourpassword"
  }'
# Vending Machine API

This is a simple vending machine API built using Node.js, Express, and MongoDB.

# To see the API documentation, please visit the following link: [API Documentation](https://documenter.getpostman.com/view/28617348/2s9YywffHj#aedeefb4-3528-46a8-ae39-81f0c270348b)

## Setup

- ### Clone the repository
  ```bash
  https://github.com/AbdelrahmanAshrafMohamedelsayed/FlapKapBackendChallenge.git
  ```
- ### Navigate to the project directory:
  ```bash
    cd FlapKapBackendChallenge
  ```
- ### Install the dependencies
  ```bash
    npm install
  ```
- ### Create a .env file in the root directory and add the following environment variables:

  ```bash
    NODE_ENV=development
    PORT=3000
    DATABASE_URL=YOUR_DATABASE
    DATABASE_PASSWORD=YOUR_PASSWORD
    JWT_SECRET=my-ultra-secure-and-ultra-long-secret
    JWT_EXPIRES_IN=90d
    JWT_COOKIE_EXPIRES_IN=90
  ```

- ### Start the server
  ```bash
    npm start
  ```

# security considerations

- Ensure proper authentication is used for sensitive endpoints.
- Ensure proper authorization is used for sensitive endpoints.
- Set a strong secret key for JWT authentication.
- Ensure proper validation is used for user input.
- Ensure proper error handling is used.
- Ensure proper logging is used.

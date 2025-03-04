# Currency Converter

## Overview

Currency Converter is a web application that allows users to convert amounts between different currencies using real-time exchange rates. The application fetches exchange rates from an external API and displays the converted amount in a user-friendly interface. Upon loading it also provides the user with a snapshot of the current exchange rates for hundreds of currencies, with outliers removed and sorted in order of their strength against the Euro.

## Features

- Convert currencies using real-time exchange rates from Fixer.io.
- Submit feedback through a contact form to personal DB, for user input validation/sanitation practice.
- User-friendly interface with responsive design.

## Security Best Practices

- Store sensitive information in environment variables.
- Validate and sanitize all user inputs.
- Use HTTPS to encrypt data in transit.
- Use secure HTTP headers with `helmet`.
- Implement rate limiting with `express-rate-limit`.
- Ensure proper authentication and authorization.
- Avoid exposing stack traces and detailed error messages to users.

## Prerequisites

1. **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
2. **MongoDB**: Ensure you have MongoDB installed and running. You can download it from [mongodb.com](https://www.mongodb.com/try/download/community).
3. **Fixer.io API Key**: Sign up at [fixer.io](https://fixer.io/) to get an API key for the exchange rate API.

## Steps to Run the Project

1. **Clone the Repository**:

    ```sh
    git clone https://github.com/lewis-2759/.NETCurrencyConverter.git
    ```

2. **Install Dependencies**:

    ```sh
    npm install
    ```

3. **Create a `.env` File**:

    Create a `.env` file in the root directory of your project and add your Fixer API key to it.
    Also add your MongoDB URI, 27017 is default

    ```env
    API_KEY=your_api_key_here
    MONGODB_URI=mongodb://localhost:27017/feedbackDB 
    ```

4. **Start MongoDB**:

    Ensure MongoDB is running. You can start it using the following command:

    ```sh
    brew services start mongodb/brew/mongodb-community

    ```

    Here is how to view data in feedback if you are new to MongoDB:

    ```sh
    mongosh
    use feedback //or name defined in .env file
    db.feedbacks.find().pretty()
    brew services stop mongodb-community //to stop db running
    ```

5. **Run the Server**:

    Start the server using Node.js.

    ```sh
    node server.js
    ```

6. **Open the Application**:

    Open your browser and navigate to `http://localhost:3000` to use the application.

## Project Structure

- `server.js`: The main server file.
- `wwwroot/`: Directory containing static files (HTML, CSS, JS).
- `.env`: Environment variables file (not included in the repository for obvious reasons).

## Frameworks and Languages Used

- Node.js
- Express.js
- dotenv
- MongoDB
- HTML, CSS, JavaScript

## Acknowledgements

- Fixer.io for providing the exchange rate data.
- Chart.js for the charting library.

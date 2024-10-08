# E-Commerce Platform

## Description
This project is an e-commerce platform that offers a wide range of products including electronics, furniture, and more. It features a responsive web interface for browsing products, user authentication, and a shopping cart system.

## Features
- Product browsing by category
- User authentication (signup, login, logout)
- Shopping cart functionality
- Product search
- Responsive design for mobile and desktop

## Technologies Used
- Frontend: React.js
- Backend: Node.js with Express
- Database: MongoDB
- State Management: Redux (assumed)
- Styling: CSS (possibly with a framework like Bootstrap or Tailwind)

## Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/ecommerce-platform.git
   ```

2. Install dependencies for both frontend and backend
   ```
   cd ecommerce-platform
   npm install
   cd client
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory and add the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development server
   ```
   npm run dev
   ```

## Usage
After starting the development server, the application will be available at `http://localhost:3000`. The backend API will be running on `http://localhost:8080`.

## API Endpoints
- POST /auth/signup - User registration
- POST /auth/login - User login
- GET /api/products - Fetch all products
- GET /api/products/:id - Fetch a single product
- POST /api/cart - Add item to cart
- GET /api/cart - View cart
- (Add other endpoints as needed)

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License.

# UNICAMPUS

UNICAMPUS is a full-stack application designed to streamline campus management processes. It includes features for students, faculty, and administrators, such as attendance tracking, library management, grading, and more.

## Features

### Student Features
- View and manage attendance.
- Access library resources and borrowed books.
- Request recommendation letters.
- View grades and feedback.

### Faculty Features
- Mark attendance for students.
- Manage assignments and grading.
- Access feedback analytics.
- Manage library resources.

### Admin Features
- Manage student and faculty accounts.
- Oversee campus placements.
- Generate analytics and reports.
- Handle library and resource management.

## Technologies Used

### Frontend
- **React**: For building the user interface.
- **TypeScript**: For type-safe development.
- **Vite**: For fast development and build tooling.

### Backend
- **Node.js**: For server-side logic.
- **Express.js**: For building RESTful APIs.
- **MongoDB**: For database management.

### AI Service
- **Python**: For AI-based chatbot and recommendation systems.
- **Flask**: For serving AI endpoints.

## Installation

### Prerequisites
- Node.js and npm installed.
- Python and pip installed.
- MongoDB instance running.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Tauqeer2907/smart-campus.git
   cd smart-campus
   ```

2. Install dependencies for the client:
   ```bash
   cd client
   npm install
   ```

3. Install dependencies for the server:
   ```bash
   cd ../server
   npm install
   ```

4. Set up the AI service:
   ```bash
   cd ../ai-service
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. Configure environment variables for the server and AI service.

6. Start the services:
   - Client:
     ```bash
     cd ../client
     npm start
     ```
   - Server:
     ```bash
     cd ../server
     node src/index.js
     ```
   - AI Service:
     ```bash
     cd ../ai-service
     python app.py
     ```

## Usage
- Access the client at `http://localhost:3000`.
- The server runs on `http://localhost:5000`.
- The AI service runs on `http://localhost:8000`.

## Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
- Thanks to all contributors and the open-source community for their support.

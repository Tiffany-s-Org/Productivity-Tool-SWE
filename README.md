# OrganAIze

OrganAIze is a full-stack productivity tool designed to help users manage tasks, events, and goals while reducing burnout. This guide will walk you through setting up and running the app locally.

Include:
	Task management (to-do list)
	User Authentication (Login)
	Progress tracking (To-do, in progress, completed, archive)


For college students who struggle to manage tasks and stay organized between academic and personal responsibilities, this productivity tool is a task management web application that helps users efficiently organize and prioritize their tasks to improve productivity. Unlike traditional to-do lists or manual planners, our product offers a dynamic, user-friendly interface that integrates task management, goal setting, and real-time progress tracking in one seamless platform.

Our app will add events to the calendar and assign time slots for each assignment or event based on several factors like estimated time, due date, priority, and more. It’ll also automatically allot time for breaks so that students won’t forget to take a break. This will reduce burnout for students and help them finish assignments within the allotted time. 

## Running the App Locally

Follow these steps to get OrganAIze running on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/Tiffany-s-Org/Productivity-Tool-SWE.git
```

### 2. Navigate to the Frontend Directory
```bash
cd organAIze
```

### 3. Install Frontend Dependencies
```bash
npm install
```

### 4. Navigate to the Backend Directory
```bash
cd server
```

### 5. Install Backend Dependencies
```bash
npm install
```

### 6. Start the Backend Server
```bash
node server.js
```
>  Note: Once the backend server is running, leave this terminal open as it will continue to run the backend.

### 7. Open a New Terminal
- Open a second terminal window in VS Code (or your preferred editor).

### 8. Navigate Back to the Frontend Directory
```bash
cd organAIze
```

### 9. Start the Frontend Development Server
```bash
npm run dev
```

### 10. Access the App
- Open your browser and go to [http://localhost:5173](http://localhost:5173) to use OrganAIze!

## Technologies Used
- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **AI Integration:** Llama AI API


import React from "react";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to React with Docker Compose!</h1>
        <p>
          This is a React application running in Docker with Nginx as a reverse
          proxy.
        </p>
        <ul>
          <li>React: Development server on port 3000</li>
          <li>Nginx: Serving the built app on port 80</li>
        </ul>
      </header>
    </div>
  );
}

export default App;

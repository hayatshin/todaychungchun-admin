import logo from "./logo.svg";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import SignIn from "./routes/SignIn";
import Summary from "./routes/Summary";
import Users from "./routes/Users";
import Ranks from "./routes/Ranks";
import { useRef, useState } from "react";
import Service from "./routes/Service";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NotLoggedIn from "./routes/NotLoggedIn";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  console.log(loggedIn);

  // const auth = getAuth();
  // onAuthStateChanged(auth, async (user) => {
  //   if (user) {
  //     setLoggedIn(true);
  //   } else {
  //     setLoggedIn(false);
  //   }
  // });

  const changeLoggedInState = (loggedInState) => {
    setLoggedIn(loggedInState);
  };

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route
          path="/"
          element={<SignIn changeLoggedInState={changeLoggedInState} />}
        />
        <Route
          path="/summary"
          element={loggedIn ? <Summary /> : <NotLoggedIn />}
        />
        <Route path="/users" element={loggedIn ? <Users /> : <NotLoggedIn />} />
        <Route path="/ranks" element={loggedIn ? <Ranks /> : <NotLoggedIn />} />
        <Route
          path="/service"
          element={loggedIn ? <Service /> : <NotLoggedIn />}
        />
      </Routes>
    </Router>
  );
}

export default App;

import React from "react";
import "./App.css";
import {
  Routes,
  Route,
  useNavigate,
  HashRouter as Router,
} from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import SignIn from "./routes/SignIn";
import Summary from "./routes/Summary";
import Users from "./routes/Users";
import Ranks from "./routes/Ranks";
import { useEffect, useRef, useState } from "react";
import Service from "./routes/Service";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NotLoggedIn from "./routes/NotLoggedIn";
import SideBar from "./components/SideBar";
import { firebaseAuth } from "./initFirebase";

function App() {
  const [init, setInit] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [clickRegion, setClickRegion] = useState("");
  const [mainCheck, setMainCheck] = useState(true);

  const changeRegion = React.useCallback((passedRegion) => {
    setClickRegion(passedRegion);
  }, []);

  const changeMainCheck = React.useCallback((passedMainBool) => {
    setMainCheck(passedMainBool);
  }, []);

  useEffect(() => {
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      setInit(true);
    });
  }, []);

  return (
    <>
      {init ? (
        <Router>
          {mainCheck ? <SideBar changeRegion={changeRegion} /> : null}
          <Routes>
            <Route
              path="/"
              element={<SignIn changeMainCheck={changeMainCheck} />}
            />
            <Route
              path="/summary"
              element={
                loggedIn ? (
                  <Summary
                    changeMainCheck={changeMainCheck}
                    clickRegion={clickRegion}
                  />
                ) : (
                  <NotLoggedIn changeMainCheck={changeMainCheck} />
                )
              }
            />
            <Route
              path="/users"
              element={
                loggedIn ? (
                  <Users
                    changeMainCheck={changeMainCheck}
                    clickRegion={clickRegion}
                  />
                ) : (
                  <NotLoggedIn changeMainCheck={changeMainCheck} />
                )
              }
            />
            <Route
              path="/ranks"
              element={
                loggedIn ? (
                  <Ranks
                    changeMainCheck={changeMainCheck}
                    clickRegion={clickRegion}
                  />
                ) : (
                  <NotLoggedIn changeMainCheck={changeMainCheck} />
                )
              }
            />
            <Route
              path="/service"
              element={
                loggedIn ? (
                  <Service
                    changeMainCheck={changeMainCheck}
                    clickRegion={clickRegion}
                  />
                ) : (
                  <NotLoggedIn changeMainCheck={changeMainCheck} />
                )
              }
            />
          </Routes>
        </Router>
      ) : (
        <div
          style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner
            style={{ marginRight: 10, width: 50, height: 50, borderWidth: 7 }}
            animation="border"
            variant="dark"
          />
        </div>
      )}
    </>
  );
}

export default App;

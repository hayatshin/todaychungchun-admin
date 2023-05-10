import React from "react";
import "./App.css";
import { Routes, Route, HashRouter as Router } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import SignIn from "./routes/SignIn";
import Summary from "./routes/Summary";
import Users from "./routes/Users";
import Ranks from "./routes/Ranks";
import { useEffect, useRef, useState } from "react";
import Service from "./routes/Service";
import NotLoggedIn from "./routes/NotLoggedIn";
import SideBar from "./components/SideBar";
import { firebaseAuth } from "./initFirebase";
import Event from "./routes/Event";
import SubEvent from "./routes/SubEvent";
import Mood from "./routes/Mood";

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
            <Route
              path="/mood"
              element={
                loggedIn ? (
                  <Mood
                    changeMainCheck={changeMainCheck}
                    clickRegion={clickRegion}
                  />
                ) : (
                  <NotLoggedIn changeMainCheck={changeMainCheck} />
                )
              }
            />
            <Route
              path="/event"
              element={
                loggedIn ? (
                  <Event
                    changeMainCheck={changeMainCheck}
                    clickRegion={clickRegion}
                  />
                ) : (
                  <NotLoggedIn changeMainCheck={changeMainCheck} />
                )
              }
            />
            <Route
              path="/event/:eventId"
              element={
                loggedIn ? (
                  <SubEvent
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

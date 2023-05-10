import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import SideBar from "../components/SideBar";
import { firebaseAuth, firebaseDB } from "../initFirebase";
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  deleteDoc,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Table from "react-bootstrap/Table";
import { Button, ButtonGroup, Dropdown, DropdownButton } from "react-bootstrap";
import { faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import colors from "../colors";
import { deleteUser, getAuth, onAuthStateChanged } from "firebase/auth";
import ReactHelmet from "../components/ReactHelmet";

function Mood({ changeMainCheck, clickRegion }) {
  const [loading, setLoading] = useState(false);
  const [userDataList, setUserDataList] = useState([]);
  const [userRemoveCheck, setUserRemoveCheck] = useState({
    state: false,
    userName: "",
    userId: "",
  });
  const [searchOrder, setSearchOrder] = useState("userName");
  const [searchInput, setSearchInput] = useState("");
  const [originalUserDataList, setOriginalUserDataList] = useState([]);
  // const [clickRegion, setClickRegion] = useState("");

  changeMainCheck(true);

  async function getUsersData() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        let currentUserId = user.uid;

        // 지역
        const adminDocRef = doc(firebaseDB, "admin", currentUserId);
        const adminDocSnap = await getDoc(adminDocRef);

        if (adminDocSnap.exists()) {
          const adminRegion = adminDocSnap.data().region;
          const adminSmallRegion = adminDocSnap.data().smallRegion;
          const adminFullRegion = `${adminRegion} ${adminSmallRegion}`;

          // 유저
          const q = query(collection(firebaseDB, "users"));
          const querySnapshot = await getDocs(q);
          let count = 0;

          for (var i in querySnapshot.docs) {
            const doc = querySnapshot.docs[i].data();
            const docId = doc.userId;
            const docRegion = doc.region;
            const docSmallRegion = doc.smallRegion;
            const docFullRegion = `${docRegion} ${docSmallRegion}`;

            if (docId != "default_user") {
              if (adminRegion == "전체") {
                const docObject = { index: count, ...doc };
                setUserDataList((currentList) => [...currentList, docObject]);
                setOriginalUserDataList((currentList) => [
                  ...currentList,
                  docObject,
                ]);
              } else {
                if (docFullRegion == adminFullRegion) {
                  const docObject = { index: count, ...doc };
                  setUserDataList((currentList) => [...currentList, docObject]);
                  setOriginalUserDataList((currentList) => [
                    ...currentList,
                    docObject,
                  ]);
                }
              }
              count++;
            }
          }
          setLoading(true);
        }
      }
    });
  }

  useEffect(() => {
    setUserDataList([]);
    getUsersData();
  }, [clickRegion]);

  const searchClick = (event) => {
    event.preventDefault();

    if (searchInput != "") {
      if (searchOrder == "userName") {
        // 회원명 검색
        let filterList = originalUserDataList.filter((item) =>
          item.name.includes(searchInput)
        );
        setUserDataList(filterList);
        // setSearchInput("");
      } else {
        // 핸드폰 번호 검색

        let filterList = originalUserDataList.filter((item) =>
          item.phone.includes(searchInput)
        );
        setUserDataList(filterList);
        // setSearchInput("");
      }
    } else {
      setOriginalUserDataList([]);
      setUserDataList([]);
      getUsersData();
    }
  };

  return (
    <>
      <ReactHelmet title={"마음 관리"} />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "start",
          position: "relative",
          flex: 1,
        }}
      >
        <div
          style={{
            marginLeft: "240px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            alignItems: "flex-start",
            overflowY: "scroll",
            width: "100vw",
            height: "100vh",
          }}
        >
          <div
            style={{
              width: "100%",
              height: 40,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: "30px",
              alignItems: "flex-start",
            }}
          >
            {/* 검색 */}

            <div>
              <form id="user-searchbar" onSubmit={searchClick}>
                <DropdownButton
                  as={ButtonGroup}
                  id="user-search-dropbox"
                  title={searchOrder == "userName" ? "회원명" : "핸드폰 번호"}
                  size="sm"
                  onSelect={(event) => setSearchOrder(event)}
                >
                  <Dropdown.Item
                    eventKey="userName"
                    value="userName"
                    id="user-search-dropbox-menu"
                  >
                    회원명
                  </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="userPhone"
                    value="userPhone"
                    id="user-search-dropbox-menu"
                  >
                    핸드폰 번호
                  </Dropdown.Item>
                </DropdownButton>
                <input
                  id="user-search-input"
                  type="text"
                  placeholder={
                    searchOrder == "userName"
                      ? "회원명 검색"
                      : "핸드폰 번호 검색"
                  }
                  aria-label="Recipient's username"
                  aria-describedby="basic-addon2"
                  onChange={(event) => setSearchInput(event.target.value)}
                  value={searchInput}
                />
                <div class="input-group-append">
                  <button
                    id="user-search-button"
                    class="btn btn-outline-secondary"
                    type="submit"
                  >
                    검색
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Mood;

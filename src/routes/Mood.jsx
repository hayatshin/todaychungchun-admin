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
  Timestamp,
} from "firebase/firestore";
import Table from "react-bootstrap/Table";
import { Button, ButtonGroup, Dropdown, DropdownButton } from "react-bootstrap";
import { faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import colors from "../colors";
import { deleteUser, getAuth, onAuthStateChanged } from "firebase/auth";
import ReactHelmet from "../components/ReactHelmet";
import ReactApexChart from "react-apexcharts";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import styled from "styled-components";
import illustIcon from "../assets/illust_icon.png";

const MultiText = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.mainColor};
`;

function Mood({ changeMainCheck, clickRegion }) {
  const [loading, setLoading] = useState(false);
  const [searchOrder, setSearchOrder] = useState("userName");
  const [searchInput, setSearchInput] = useState("");
  const [multiSearchUsers, setMultiSearchUsers] = useState(false);
  const [userDataList, setUserDataList] = useState([]);
  const [searchUserIdArray, setSearchUserIdArray] = useState([]);
  const [userMoodChanges, setUserMoodChanges] = useState([]);
  const [userMoodDates, setUserMoodDates] = useState([]);

  changeMainCheck(true);

  const series = [
    {
      name: "Desktops",
      data: userMoodChanges,
    },
  ];

  const options = {
    chart: {
      height: 400,
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
    },
    title: {
      text:
        searchUserIdArray[0]?.name == undefined || searchUserIdArray.length != 1
          ? ""
          : `${searchUserIdArray[0].name}님의 감정 변화`,
      align: "left",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    stroke: {
      colors: "#FF2D78",
    },
    xaxis: {
      categories: userMoodDates,
    },
    yaxis: {
      min: 1,
      max: 10,
    },
  };

  async function getUsers() {
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
              } else {
                if (docFullRegion == adminFullRegion) {
                  const docObject = { index: count, ...doc };
                  setUserDataList((currentList) => [...currentList, docObject]);
                }
              }
              count++;
            }
          }
        }
      }
    });
  }

  async function getDiaries(searchUserId) {
    const q = query(
      collection(firebaseDB, "diary"),
      where("userId", "==", searchUserId)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      let userDate = new Timestamp(
        doc.data().timestamp.seconds,
        doc.data().timestamp.nanoseconds
      )
        .toDate()
        .toISOString()
        .slice(0, 10);

      setUserMoodChanges((currentData) => [
        ...currentData,
        10 - parseInt(doc.data().todayMood.position),
      ]);
      setUserMoodDates((currentData) => [...currentData, userDate]);
    });
  }

  const searchClick = async () => {
    if (searchInput != "") {
      if (searchOrder == "userName") {
        // 회원명 검색

        for (let i = 0; i < userDataList.length; i++) {
          if (userDataList[i].name.includes(searchInput)) {
            setSearchUserIdArray((currentData) => [
              ...currentData,
              userDataList[i],
            ]);
            // if (searchUserIdArray.length == 1) {
            //   getDiaries(searchUserIdArray[0].userId);
            // } else {
            // }
          }
        }
      } else {
        // 핸드폰 번호 검색
        for (let i = 0; i < userDataList.length; i++) {
          if (userDataList[i].phone.includes(searchInput)) {
            setSearchUserIdArray((currentData) => [
              ...currentData,
              userDataList[i],
            ]);
            // if (searchUserIdArray.length == 1) {
            //   getDiaries(searchUserIdArray[0].userId);
            // } else {
            // }
          }
        }
      }
    }
  };

  async function userClickAndGraph(event) {
    event.preventDefault();

    setSearchUserIdArray([]);
    setMultiSearchUsers(false);
    setUserMoodChanges([]);
    setUserMoodDates([]);

    searchClick();
  }

  function selectUserTable(index) {
    const filteredArray = searchUserIdArray.filter(
      (item) => item.index == index
    );
    setSearchUserIdArray((currentData) => [...filteredArray]);
  }

  // useEffect

  useEffect(() => {
    console.log("region");

    setUserDataList([]);
    setSearchUserIdArray([]);
    setMultiSearchUsers(false);
    setUserMoodChanges([]);
    setUserMoodDates([]);

    getUsers();
  }, [clickRegion]);

  useEffect(() => {
    if (searchUserIdArray.length == 0) {
      setMultiSearchUsers(false);
    } else if (searchUserIdArray.length == 1) {
      setMultiSearchUsers(false);
      getDiaries(searchUserIdArray[0].userId);
    } else {
      setMultiSearchUsers(true);
    }
  }, [searchUserIdArray]);

  const UserTableRow = (item, index) => {
    var reformatBirthDate = `${item.birthYear}-${item.birthDay.slice(
      0,
      2
    )}-${item.birthDay.slice(2, 4)} `;
    if (item.region != undefined && item.smallRegion != undefined) {
      var reformatRegion = `${item.region} ${item.smallRegion}`;
    } else {
      var reformatRegion = "정보 없음";
    }

    return (
      <tr key={item.index}>
        <td>{item.name}</td>
        <td>{item.gender}</td>
        <td>{item.userAge}</td>
        <td>{reformatBirthDate}</td>
        <td>{item.phone}</td>
        <td>{reformatRegion}</td>
        <td>
          <FontAwesomeIcon
            icon={faCircleCheck}
            style={{ color: colors.subMainColor, cursor: "pointer" }}
            onClick={() => selectUserTable(item.index)}
          />
        </td>
      </tr>
    );
  };

  return (
    <>
      <ReactHelmet title={"마음 관리"} />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "start",
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
              <form id="user-searchbar" onSubmit={userClickAndGraph}>
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

          {/* 여러명의 경우 */}

          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            {multiSearchUsers ? (
              <div
                style={{
                  width: "90%",
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "start",
                  flexDirection: "row",
                }}
              >
                <img
                  style={{ width: "70px", marginRight: "30px" }}
                  src={illustIcon}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <MultiText>여러 유저가 검색되었습니다.</MultiText>
                  <MultiText>한 명을 선택해주세요.</MultiText>
                </div>
              </div>
            ) : null}

            <Table
              striped
              hover
              size="sm"
              style={{
                marginTop: "30px",
                width: "90%",
                tableLayout: "fixed",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>이름</th>
                  <th style={{ width: "90px" }}>성별</th>
                  <th style={{ width: "80px" }}>나이</th>
                  <th style={{ width: "140px" }}>생년월일</th>
                  <th style={{ width: "170px" }}>핸드폰 번호</th>
                  <th>거주 지역</th>
                  <th style={{ width: "70px" }}>선택</th>
                </tr>
              </thead>
              <tbody>
                {searchUserIdArray.map((item) => UserTableRow(item))}
              </tbody>
            </Table>
          </div>

          {/* 차트 */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "60px",
            }}
          >
            <div style={{ width: "80%" }}>
              <ReactApexChart
                options={options}
                series={series}
                type="line"
                height={400}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Mood;

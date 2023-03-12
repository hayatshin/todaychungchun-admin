import async from "async";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SideBar from "../components/SideBar";
import { firebaseDB } from "../initFirebase";
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  deleteDoc,
} from "firebase/firestore";
import Table from "react-bootstrap/Table";
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownButton,
  Spinner,
} from "react-bootstrap";
import { faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import colors from "../colors";
import illustIcon from "../assets/illust_icon.png";
import { CSVLink, CSVDownload } from "react-csv";
import { faCircleDown as faCircleDownOutline } from "@fortawesome/free-regular-svg-icons";
import { faCircleDown as faCircleDownFill } from "@fortawesome/free-solid-svg-icons";
import { MenuItem, Select } from "@mui/material";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Users() {
  const [loading, setLoading] = useState(false);
  const [userDataList, setUserDataList] = useState([]);
  const [userRemoveCheck, setUserRemoveCheck] = useState({
    state: false,
    userName: "",
    userId: "",
  });
  const [userRemoveFinished, setUserRemoveFinished] = useState([]);
  const [csvHover, setCsvHover] = useState(false);
  const [searchOrder, setSearchOrder] = useState("userName");
  const [searchInput, setSearchInput] = useState("");
  const [originalUserDataList, setOriginalUserDataList] = useState([]);
  const [clickRegion, setClickRegion] = useState("");

  // csv
  const csvdata = () => {
    let csvLine = [
      ["#", "이름", "나이", "출생년도", "핸드폰 번호", "거주 지역"],
    ];
    userDataList.forEach((item) => {
      var reformatBirthDate = `${item.birthYear}-${item.birthDay.slice(
        0,
        2
      )}-${item.birthDay.slice(2, 4)} `;
      var reformatRegion = `${item.region} ${item.smallRegion}`;
      csvLine.push([
        (parseInt(item.index) + 1).toString(),
        item.name,
        item.userAge.toString(),
        reformatBirthDate,
        item.phone,
        reformatRegion,
      ]);
    });
    return csvLine;
  };

  const userRemoveButtonClicked = (userName, userId) => {
    setUserRemoveCheck({
      state: true,
      userName: `${userName}님`,
      userId,
    });
  };

  const userRemoveConfirmButtonClicked = async () => {
    await deleteDoc(doc(firebaseDB, "users", userRemoveCheck.userId));
    setUserRemoveCheck({ state: false, userName: "", userId: "" });
    setUserRemoveFinished((currentList) => [
      ...currentList,
      userRemoveCheck.userId,
    ]);
  };

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

          for (var i in querySnapshot.docs) {
            const doc = querySnapshot.docs[i].data();
            const docRegion = doc.region;
            const docSmallRegion = doc.smallRegion;
            const docFullRegion = `${docRegion} ${docSmallRegion}`;

            if (adminRegion == "전체") {
              const docObject = { index: i, ...doc };
              setUserDataList((currentList) => [...currentList, docObject]);
              setOriginalUserDataList((currentList) => [
                ...currentList,
                docObject,
              ]);
            } else {
              if (docFullRegion == adminFullRegion) {
                const docObject = { index: i, ...doc };
                setUserDataList((currentList) => [...currentList, docObject]);
                setOriginalUserDataList((currentList) => [
                  ...currentList,
                  docObject,
                ]);
              }
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
  }, [userRemoveFinished, clickRegion]);

  const UserTableRow = (item) => {
    var reformatBirthDate = `${item.birthYear}-${item.birthDay.slice(
      0,
      2
    )}-${item.birthDay.slice(2, 4)} `;
    var reformatRegion = `${item.region} ${item.smallRegion}`;

    return (
      <tr key={item.index}>
        <td>{parseInt(item.index) + 1}</td>
        <td>{item.name}</td>
        <td>{item.gender}</td>
        <td>{item.userAge}</td>
        <td>{reformatBirthDate}</td>
        <td>{item.phone}</td>
        <td>{reformatRegion}</td>
        <td>
          <FontAwesomeIcon
            icon={faUserMinus}
            style={{ color: colors.subMainColor, cursor: "pointer" }}
            onClick={() => userRemoveButtonClicked(item.name, item.userId)}
          />
        </td>
      </tr>
    );
  };

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

  const changeRegion = (passedRegion) => {
    setClickRegion(passedRegion);
  };

  return (
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
      <SideBar changeRegion={changeRegion} />
      {userRemoveCheck.state ? (
        <div
          class="userDeleteLayout"
          style={{
            flexGrow: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: "280px",
              height: "180px",
              backgroundColor: "white",
              marginLeft: "300px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                flexGrow: 1,
              }}
            >
              <img
                style={{
                  width: "60px",
                  marginBottom: "20px",
                }}
                src={illustIcon}
              />
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span
                  class="userDeleteText"
                  style={{ fontSize: "14px", color: colors.mainColor }}
                >
                  {userRemoveCheck.userName}
                </span>
                <span class="userDeleteText" style={{ fontSize: "14px" }}>
                  을 정말로 삭제하시겠습니까?
                </span>
              </div>
            </div>
            <div
              style={{
                width: "100%",
                height: "50px",
                justifySelf: "flex-end",
                alignSelf: "flex-end",
                display: "flex",
                flexDirection: "row",
                borderTop: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRight: "1px solid",
                  borderColor: "rgba(0, 0, 0, 0.1)",
                }}
              >
                <span
                  class="deleteCancelButton"
                  style={{
                    color: colors.menuBlack,
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  onClick={() =>
                    setUserRemoveCheck({
                      state: false,
                      userName: "",
                      userId: "",
                    })
                  }
                >
                  취소
                </span>
              </div>
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span
                  class="deleteConfirmButton"
                  style={{
                    color: colors.mainColor,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                  onClick={userRemoveConfirmButtonClicked}
                >
                  삭제
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
                  searchOrder == "userName" ? "회원명 검색" : "핸드폰 번호 검색"
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
          {/* csv */}
          <button
            style={{
              border: "none",
              padding: 0,
              background: "none",
            }}
            onMouseOver={() => setCsvHover(true)}
            onMouseLeave={() => setCsvHover(false)}
          >
            <CSVLink
              data={csvdata()}
              filename={"오늘도청춘 회원정보"}
              style={{ textDecoration: "none", color: colors.mainColor }}
            >
              <FontAwesomeIcon
                style={{
                  fontSize: 24,
                  marginRight: 8,
                  color: colors.mainColor,
                }}
                icon={csvHover ? faCircleDownFill : faCircleDownOutline}
              />
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: colors.mainColor,
                }}
              >
                CSV 다운로드
              </span>
            </CSVLink>
          </button>
        </div>
        {loading ? (
          <div style={{ width: "100%", overflowY: "scroll" }}>
            <Table
              striped
              hover
              size="sm"
              style={{
                width: "100%",
                tableLayout: "fixed",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>#</th>
                  <th style={{ width: "100px" }}>이름</th>
                  <th style={{ width: "90px" }}>성별</th>
                  <th style={{ width: "80px" }}>나이</th>
                  <th style={{ width: "140px" }}>생년월일</th>
                  <th style={{ width: "170px" }}>핸드폰 번호</th>
                  <th>거주 지역</th>
                  <th style={{ width: "70px" }}>삭제</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? userDataList.map((item) => UserTableRow(item))
                  : null}
              </tbody>
            </Table>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spinner
              style={{ marginRight: 10 }}
              animation="grow"
              variant="primary"
            />
            <Spinner
              style={{ marginRight: 10 }}
              animation="grow"
              variant="primary"
            />
            <Spinner animation="grow" variant="primary" />
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;

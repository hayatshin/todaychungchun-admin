import React from "react";
import SideBar from "../components/SideBar";
import Table from "react-bootstrap/Table";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { TextField } from "@mui/material";
import colors from "../colors";
import { useCallback, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { CSVLink } from "react-csv";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { firebaseDB } from "../initFirebase";
import { format, parseISO } from "date-fns";
import moment from "moment";
import { Spinner } from "react-bootstrap";
import { faCircleDown as faCircleDownOutline } from "@fortawesome/free-regular-svg-icons";
import { faCircleDown as faCircleDownFill } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReactHelmet from "../components/ReactHelmet";

function Ranks({ changeMainCheck, clickRegion }) {
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [resultUserPointList, setResultUserPointList] = useState([]);
  const [orderStandard, setOrderStandard] = useState("total");
  const [csvHover, setCsvHover] = useState(false);

  changeMainCheck(true);

  // 시간 설정
  const getDaysArray = function (start, end) {
    for (
      var arr = [], dt = new Date(start);
      dt <= new Date(end);
      dt.setDate(dt.getDate() + 1)
    ) {
      arr.push(new Date(dt));
    }
    return arr;
  };

  // 숫자 콤마 포맷
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  let dateFormatList = getDaysArray(startTime, endTime);
  let stringFormatList = dateFormatList.map((day) =>
    day.toISOString().slice(0, 10)
  );

  async function initialPointListSet() {
    let userPointList = [];

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
            var userId = doc.userId;
            var userRegion = `${doc.region} ${doc.smallRegion}`;

            if (userId != "default_user") {
              if (adminRegion == "전체") {
                const docObject = {
                  ranking: 0,
                  userId: doc.userId,
                  userName: doc.name,
                  userGender: doc.gender,
                  userAge: doc.userAge,
                  userPhone: doc.phone,
                  userRegion,
                  totalPoint: 0,
                  stepCount: 0,
                  diaryCount: 0,
                  likeCount: 0,
                  commentCount: 0,
                };
                userPointList.push(docObject);
              } else {
                if (userRegion == adminFullRegion) {
                  const docObject = {
                    ranking: 0,
                    userId: doc.userId,
                    userName: doc.name,
                    userGender: doc.gender,
                    userAge: doc.userAge,
                    userPhone: doc.phone,
                    userRegion,
                    totalPoint: 0,
                    stepCount: 0,
                    diaryCount: 0,
                    likeCount: 0,
                    commentCount: 0,
                  };
                  userPointList.push(docObject);
                }
              }
            }
            // setUserPointList((currentList) => [...currentList, docObject]);
          }
        }
      }
    });
    return userPointList;
  }

  async function stepCountListSet(userPointList) {
    for (var i = 0; i < stringFormatList.length; i++) {
      const stepDocRef = doc(
        firebaseDB,
        "period_step_count",
        stringFormatList[i]
      );
      const stepDocSnap = await getDoc(stepDocRef);
      if (stepDocSnap.exists()) {
        const periodDocument = stepDocSnap.data();
        for (var periodUserId in periodDocument) {
          // console.log("periodUserId", periodUserId);
          const sameUserIndex = userPointList.findIndex(
            (eachSet) => eachSet.userId == periodUserId
          );
          if (sameUserIndex != -1) {
            // stepCount
            userPointList[sameUserIndex].stepCount +=
              periodDocument[periodUserId];
          }
        }
      } else {
      }
    }
    return userPointList;
  }

  async function diaryCountListSet(userPointList) {
    const diaryRef = collection(firebaseDB, "diary");

    const diaryQuery = query(
      diaryRef,
      where("timestamp", ">=", startTime),
      where("timestamp", "<=", endTime)
    );
    const diarySnapshot = await getDocs(diaryQuery);

    diarySnapshot.forEach((doc) => {
      const sameUserIndex = userPointList.findIndex(
        (eachSet) => eachSet.userId == doc.data().userId
      );
      if (sameUserIndex != -1) {
        // diaryCount
        userPointList[sameUserIndex].diaryCount += 1;
      }
    });
    return userPointList;
  }

  async function commentsCountListSet(userPointList) {
    const commentsRef = collectionGroup(firebaseDB, "comments");

    const commentsQuery = query(
      commentsRef,
      where("timestamp", ">=", startTime),
      where("timestamp", "<=", endTime)
    );
    const commentsSnapshot = await getDocs(commentsQuery);

    commentsSnapshot.forEach((doc) => {
      const sameUserIndex = userPointList.findIndex(
        (eachSet) => eachSet.userId == doc.data().userId
      );
      if (sameUserIndex != -1) {
        // diaryCount
        userPointList[sameUserIndex].commentCount += 1;
      }
    });
    return userPointList;
  }

  async function likesCountListSet(userPointList) {
    const likesRef = collectionGroup(firebaseDB, "likes");

    const likesQuery = query(
      likesRef,
      where("timestamp", ">=", startTime),
      where("timestamp", "<=", endTime)
    );
    const likesSnapshot = await getDocs(likesQuery);

    likesSnapshot.forEach((doc) => {
      const sameUserIndex = userPointList.findIndex(
        (eachSet) => eachSet.userId == doc.data().userId
      );
      if (sameUserIndex != -1) {
        // diaryCount
        userPointList[sameUserIndex].likeCount += 1;
      }
    });
    return userPointList;
  }

  const totalPointCalculate = (userPointList) => {
    for (var i = 0; i < userPointList.length; i++) {
      userPointList[i].totalPoint =
        Math.floor(userPointList[i].stepCount / 1000) * 10 +
        userPointList[i].diaryCount * 100 +
        userPointList[i].commentCount * 20 +
        userPointList[i].likeCount * 10;
    }
    return userPointList;
    // setResultUserPointList(userPointList);
  };

  const orderPointList = (userPointList) => {
    // 정렬
    if (orderStandard == "total") {
      userPointList.sort((a, b) => b.totalPoint - a.totalPoint);
      let rankingCount = 1;

      // 순위
      for (var i = 0; i < userPointList.length; i++) {
        userPointList[i].ranking = rankingCount;

        if (i != userPointList.length - 1) {
          if (userPointList[i].totalPoint != userPointList[i + 1].totalPoint) {
            rankingCount++;
          }
        }
      }
    } else if (orderStandard == "step") {
      userPointList.sort((a, b) => b.stepCount - a.stepCount);
      let rankingCount = 1;

      // 순위
      for (var i = 0; i < userPointList.length; i++) {
        userPointList[i].ranking = rankingCount;

        if (i != userPointList.length - 1) {
          if (userPointList[i].stepCount != userPointList[i + 1].stepCount) {
            rankingCount++;
          }
        }
      }
    } else if (orderStandard == "diary") {
      userPointList.sort((a, b) => b.diaryCount - a.diaryCount);
      let rankingCount = 1;

      // 순위
      for (var i = 0; i < userPointList.length; i++) {
        userPointList[i].ranking = rankingCount;

        if (i != userPointList.length - 1) {
          if (userPointList[i].diaryCount != userPointList[i + 1].diaryCount) {
            rankingCount++;
          }
        }
      }
    }
    setResultUserPointList(userPointList);
    setLoading(true);
  };

  useEffect(() => {
    setLoading(false);
    initialPointListSet().then((userPointList) =>
      stepCountListSet(userPointList).then((userPointList) =>
        diaryCountListSet(userPointList).then((userPointList) =>
          commentsCountListSet(userPointList).then((userPointList) =>
            likesCountListSet(userPointList)
              .then((userPointList) => totalPointCalculate(userPointList))
              .then((userPointList) => orderPointList(userPointList))
          )
        )
      )
    );
  }, [startTime, endTime, orderStandard, clickRegion]);

  const rankingTableRow = (item) => {
    return (
      <tr key={item.userId}>
        <td>{item.ranking}</td>
        <td>{item.userName}</td>
        <td>{item.userGender}</td>
        <td>{item.userAge}</td>
        <td>{item.userPhone}</td>
        <td>{item.userRegion}</td>
        <td className="point-td">{numberWithCommas(item.totalPoint)}</td>
        <td className="point-td">{numberWithCommas(item.stepCount)}</td>
        <td className="point-td">{numberWithCommas(item.diaryCount)}</td>
      </tr>
    );
  };

  const csvdata = () => {
    let csvLine = [
      [
        "순위",
        "이름",
        "성별",
        "나이",
        "핸드폰 번호",
        "거주 지역",
        "전체 점수",
        "걸음수",
        "일기",
      ],
    ];
    resultUserPointList.forEach((item) => {
      csvLine.push([
        item.ranking,
        item.userName,
        item.userGender,
        item.userAge,
        item.userPhone,
        item.userRegion,
        item.totalPoint,
        item.stepCount,
        item.diaryCount,
      ]);
    });
    return csvLine;
  };

  return (
    <>
      <ReactHelmet title={"순위 정보"} />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100vw",
            height: "100vh",
            padding: "20px",
            overflowY: "scroll",
            justifyContent: "start",
            alignItems: "flex-start",
            marginLeft: "240px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: 40,
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 30,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  marginRight: 50,
                  alignItems: "center",
                }}
              >
                <DesktopDatePicker
                  inputFormat="yyyy-MM-dd"
                  className="my-datepicker"
                  label="시작 시간"
                  value={startTime}
                  onChange={(newValue) => {
                    setStartTime(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      id="datepicker-text"
                      {...params}
                      error={false}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            border: "solid 1px",
                            borderColor: "#000",
                          },
                          "&:hover fieldset": {
                            borderColor: colors.mainColor,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: colors.mainColor,
                          },
                        },
                      }}
                    />
                  )}
                />
                <span
                  style={{
                    padding: 8,
                    width: 30,
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  ~
                </span>
                <DesktopDatePicker
                  inputFormat="yyyy-MM-dd"
                  className="my-datepicker"
                  label="끝 시간"
                  value={endTime}
                  onChange={(newValue) => {
                    setEndTime(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      id="datepicker-text"
                      {...params}
                      error={false}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            border: "solid 1px",
                            borderColor: "#000",
                          },
                          "&:hover fieldset": {
                            borderColor: colors.mainColor,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: colors.mainColor,
                          },
                        },
                      }}
                    />
                  )}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    marginRight: 13,
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.menuBlack,
                  }}
                >
                  정렬 기준:
                </span>
                <ButtonGroup
                  style={{
                    height: 35,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Button
                    id="order-button"
                    variant="light"
                    style={{ width: 80 }}
                    active={orderStandard == "total" ? true : false}
                    onClick={() => setOrderStandard("total")}
                  >
                    전체 점수
                  </Button>
                  <Button
                    id="order-button"
                    variant="light"
                    style={{ width: 80 }}
                    active={orderStandard == "step" ? true : false}
                    onClick={() => setOrderStandard("step")}
                  >
                    걸음수
                  </Button>
                  <Button
                    id="order-button"
                    variant="light"
                    style={{ width: 80 }}
                    active={orderStandard == "diary" ? true : false}
                    onClick={() => setOrderStandard("diary")}
                  >
                    일기
                  </Button>
                </ButtonGroup>
              </div>
            </div>

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
              <Table striped hover size="sm" align="center">
                <thead>
                  <tr>
                    <th style={{ width: "80px" }}>순위</th>
                    <th style={{ width: "100px" }}>이름</th>
                    <th style={{ width: "90px" }}>성별</th>
                    <th style={{ width: "80px" }}>나이</th>
                    <th style={{ width: "170px" }}>핸드폰 번호</th>
                    <th>거주 지역</th>
                    <th style={{ width: "150px", textAlign: "end" }}>
                      전체 점수
                    </th>
                    <th style={{ width: "150px", textAlign: "end" }}>걸음수</th>
                    <th style={{ width: "100px", textAlign: "end" }}>일기</th>
                  </tr>
                </thead>
                <tbody>
                  {resultUserPointList.map((item) => rankingTableRow(item))}
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
                style={{ marginRight: 10, width: 20, height: 20 }}
                animation="grow"
                variant="primary"
              />
              <Spinner
                style={{ marginRight: 10, width: 20, height: 20 }}
                animation="grow"
                variant="primary"
              />
              <Spinner
                style={{ width: 20, height: 20 }}
                animation="grow"
                variant="primary"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Ranks;

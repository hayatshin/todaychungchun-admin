import { async } from "@firebase/util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Spinner, Table } from "react-bootstrap";
import { CSVLink } from "react-csv";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import colors from "../colors";
import { firebaseDB } from "../initFirebase";
import { faCircleDown as faCircleDownOutline } from "@fortawesome/free-regular-svg-icons";
import { faCircleDown as faCircleDownFill } from "@fortawesome/free-solid-svg-icons";
import ReactHelmet from "../components/ReactHelmet";

const EventRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
`;

const EventHeader = styled.span`
  font-size: 16px;
  font-weight: 600;
  margin-right: 20px;
`;

const EventText = styled.span`
  font-size: 16px;
`;

function SubEvent({ changeMainCheck, clickRegion }) {
  changeMainCheck(true);
  const { eventId } = useParams();
  const [loading, setLoading] = useState(false);
  const [subEventDataObject, setSubEventDataObject] = useState({});
  const [eventEndPeriod, setEventEndPeriod] = useState(new Date());
  const [resultUserPointList, setResultUserPointList] = useState([]);
  const [csvHover, setCsvHover] = useState(false);

  const getDaysArray = function (start, end) {
    const offset = 1000 * 60 * 60 * 9;
    setEventEndPeriod(new Date(end));

    if (start > new Date(subEventDataObject.startPeriod)) {
      for (
        var arr = [], dt = new Date(start);
        dt <= new Date(end);
        dt.setDate(dt.getDate() + 1)
      ) {
        arr.push(
          new Date(new Date(dt).getTime() + offset).toISOString().slice(0, 10)
        );
      }
    } else {
      for (
        var arr = [], dt = new Date(subEventDataObject.startPeriod);
        dt <= new Date(end);
        dt.setDate(dt.getDate() + 1)
      ) {
        arr.push(
          new Date(new Date(dt).getTime() + offset).toISOString().slice(0, 10)
        );
      }
    }
    return arr;
  };

  // 이벤트 정보
  async function getSubEventData() {
    const docRef = doc(firebaseDB, "mission", eventId);
    const docSnap = await getDoc(docRef);
    const docObject = docSnap.data();
    if (docSnap.exists()) {
      setSubEventDataObject({ ...docObject });
    }
  }

  // 참여자 정보
  async function getParticipantsData() {
    let userPointList = [];

    const participants = query(
      collectionGroup(firebaseDB, "participants"),
      where("documentId", "==", eventId)
    );
    const participantsSnap = await getDocs(participants);
    let count = 0;

    participantsSnap.forEach((doc) => {
      const participantData = doc.data();
      const eventUserId = participantData.userId;
      const eventParticipateDate = new Timestamp(
        participantData.timestamp.seconds,
        participantData.timestamp.nanoseconds
      ).toDate();

      const eventParticipatePeriod = getDaysArray(
        subEventDataObject.startPeriod.replace(".", "-"),
        subEventDataObject.endPeriod.replace(".", "-")
      );

      const eventUserObject = {
        index: count,
        userId: eventUserId,
        participateDate: eventParticipateDate,
        participatePeriod: eventParticipatePeriod,
      };
      userPointList.push(eventUserObject);
      //   setUserPointList((currentData) => [...currentData, eventUserObject]);
      count++;
    });
    return userPointList;
  }

  async function getUserOfParticipantData(userPointList) {
    for (let i = 0; i < userPointList.length; i++) {
      const userPointUserId = userPointList[i].userId;
      const userRef = doc(firebaseDB, "users", userPointUserId);
      const userSnap = await getDoc(userRef);
      userPointList[i] = {
        ...userPointList[i],
        ...userSnap.data(),
        totalPoint: 0,
        stepCount: 0,
        diaryCount: 0,
        likeCount: 0,
        commentCount: 0,
      };
    }
    return userPointList;
  }

  //   점수
  async function stepCountListSet(userPointList) {
    for (let i = 0; i < userPointList.length; i++) {
      const userParticipatePeriod = userPointList[i].participatePeriod;
      userParticipatePeriod.forEach(async (stepPeriod) => {
        const stepDocRef = doc(firebaseDB, "period_step_count", stepPeriod);
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
      });
    }
    return userPointList;
  }

  async function diaryCountListSet(userPointList) {
    const diaryRef = collection(firebaseDB, "diary");

    for (let i = 0; i < userPointList.length; i++) {
      const userParticiapteDate = userPointList[i].participateDate;
      const diaryQuery = query(
        diaryRef,
        where("timestamp", ">=", new Date(userParticiapteDate)),
        where("timestamp", "<=", eventEndPeriod)
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
    }
    return userPointList;
  }

  async function commentsCountListSet(userPointList) {
    const commentsRef = collectionGroup(firebaseDB, "comments");

    for (let i = 0; i < userPointList.length; i++) {
      const userParticiapteDate = userPointList[i].participateDate;
      const commentsQuery = query(
        commentsRef,
        where("timestamp", ">=", new Date(userParticiapteDate)),
        where("timestamp", "<=", eventEndPeriod)
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
    }
    return userPointList;
  }

  async function likesCountListSet(userPointList) {
    const likesRef = collectionGroup(firebaseDB, "likes");

    for (let i = 0; i < userPointList.length; i++) {
      const userParticiapteDate = userPointList[i].participateDate;
      const likesQuery = query(
        likesRef,
        where("timestamp", ">=", new Date(userParticiapteDate)),
        where("timestamp", "<=", eventEndPeriod)
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
    }
    return userPointList;
  }

  async function totalPointCalculate(userPointList) {
    for (let i = 0; i < userPointList.length; i++) {
      userPointList[i].totalPoint =
        Math.floor(userPointList[i].stepCount / 1000) * 10 +
        userPointList[i].diaryCount * 100 +
        userPointList[i].commentCount * 20 +
        userPointList[i].likeCount * 10;
    }
    return userPointList;
  }

  const acheiveOrNotFunction = (userPointList) => {
    const acheiveGoal = subEventDataObject.goalScore;
    for (let i = 0; i < userPointList.length; i++) {
      const acheiveOrNot =
        parseInt(userPointList[i].totalPoint) > parseInt(acheiveGoal)
          ? "달성"
          : "X";
      userPointList[i].acheiveOrNot = acheiveOrNot;
    }
    setResultUserPointList(userPointList);
    setLoading(true);
  };

  //   실행
  useEffect(() => {
    getSubEventData();
  }, []);

  useEffect(() => {
    if (Object.keys(subEventDataObject).length != 0) {
      getParticipantsData().then((userPointList) =>
        getUserOfParticipantData(userPointList).then((userPointList) =>
          stepCountListSet(userPointList).then((userPointList) =>
            diaryCountListSet(userPointList).then((userPointList) =>
              commentsCountListSet(userPointList).then((userPointList) =>
                likesCountListSet(userPointList).then((userPointList) =>
                  totalPointCalculate(userPointList).then((userPointList) =>
                    acheiveOrNotFunction(userPointList)
                  )
                )
              )
            )
          )
        )
      );
    }
  }, [subEventDataObject]);

  const csvdata = () => {
    let csvLine = [
      [
        "#",
        "이름",
        "성별",
        "나이",
        "핸드폰 번호",
        "거주 지역",
        "참여일",
        "점수",
        "달성 여부",
      ],
    ];
    resultUserPointList.forEach((item) => {
      let regionGroup = `${item.region} ${item.smallRegion}`;
      csvLine.push([
        item.index,
        item.name,
        item.gender,
        item.userAge,
        item.phone,
        regionGroup,
        new Date(item.participateDate).toISOString().slice(0, 10),
        item.totalPoint,
        item.acheiveOrNot,
      ]);
    });
    return csvLine;
  };

  const ParticipantsTableRow = (item) => {
    let regionGroup = `${item.region} ${item.smallRegion}`;
    return (
      <tr key={item.index}>
        <td>{parseInt(item.index) + 1}</td>
        <td>{item.name}</td>
        <td>{item.gender}</td>
        <td>{item.userAge}</td>
        <td>{item.phone}</td>
        <td>{regionGroup}</td>
        <td>{new Date(item.participateDate).toISOString().slice(0, 10)}</td>
        <td>{item.totalPoint}</td>
        <td>{item.acheiveOrNot}</td>
      </tr>
    );
  };

  return (
    <div
      style={{
        marginLeft: "240px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "flex-start",
        overflowY: "scroll",
      }}
    >
      <ReactHelmet title={"행사 관리"} />

      <span
        style={{
          fontSize: "25px",
          fontWeight: "600",
          marginBottom: "25px",
          backgroundColor: "rgba(255, 252, 127, 0.8)",
        }}
      >
        {subEventDataObject.title}
      </span>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <img
          style={{ width: "350px", marginRight: "50px", borderRadius: "5px" }}
          src={subEventDataObject.missionImage}
          alt="new"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            alignItems: "start",
          }}
        >
          <EventRow>
            <EventHeader>진행 상황:</EventHeader>
            <EventText>{subEventDataObject.state}</EventText>
          </EventRow>
          <EventRow>
            <EventHeader>주최 기관:</EventHeader>
            <img
              style={{
                width: "30px",
                marginRight: "10px",
                borderRadius: "20px",
              }}
              src={subEventDataObject.communityLogo}
            />
            <EventText>{subEventDataObject.community}</EventText>
          </EventRow>
          <EventRow>
            <EventHeader>시작일:</EventHeader>
            <EventText>{subEventDataObject.startPeriod}</EventText>
          </EventRow>
          <EventRow>
            <EventHeader>종료일:</EventHeader>
            <EventText>{subEventDataObject.endPeriod}</EventText>
          </EventRow>
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <EventHeader style={{ marginBottom: "10px" }}>
              행사 설명:
            </EventHeader>
            <EventText>{subEventDataObject.description}</EventText>
          </div>
        </div>
      </div>
      {/* 테이블 */}
      <div
        style={{
          width: "100%",
          height: "100px",
          display: "flex",
          justifyContent: "end",
        }}
      >
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
            filename={`${subEventDataObject.title} 참여자 정보`}
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
                <th style={{ width: "10%" }}>#</th>
                <th style={{ width: "15%" }}>이름</th>
                <th style={{ width: "10%" }}>성별</th>
                <th style={{ width: "10%" }}>나이</th>
                <th style={{ width: "20%" }}>핸드폰 번호</th>
                <th style={{ width: "25%" }}>거주 지역</th>
                <th style={{ width: "15%" }}>참여일</th>
                <th style={{ width: "15%" }}>점수</th>
                <th style={{ width: "10%" }}>달성 여부</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? resultUserPointList.map((item) => ParticipantsTableRow(item))
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
  );
}

export default SubEvent;

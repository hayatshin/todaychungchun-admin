import React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SideBar from "../components/SideBar";
import { firebaseAuth, firebaseDB } from "../initFirebase";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import Table from "react-bootstrap/Table";
import { Spinner } from "react-bootstrap";
import { faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import colors from "../colors";
import illustIcon from "../assets/illust_icon.png";
import { CSVLink, CSVDownload } from "react-csv";
import { faCircleDown as faCircleDownOutline } from "@fortawesome/free-regular-svg-icons";
import {
  faCircleDown as faCircleDownFill,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { deleteUser, getAuth, onAuthStateChanged } from "firebase/auth";
import ReactHelmet from "../components/ReactHelmet";
import { Outlet, useNavigate } from "react-router-dom";

function Event({ changeMainCheck, clickRegion }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [csvHover, setCsvHover] = useState(false);
  const [missionList, setMissionList] = useState([]);

  changeMainCheck(true);

  // csv
  const csvdata = () => {
    let csvLine = [["#", "행사", "주최 기관", "기간", "상태"]];
    missionList.forEach((item) => {
      var eventPeriod = `${item.startPeriod} - ${item.endPeriod}`;
      csvLine.push([
        (parseInt(item.index) + 1).toString(),
        item.title,
        item.community,
        eventPeriod,
        item.state,
      ]);
    });
    return csvLine;
  };

  async function getMissionData() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        let currentUserId = user.uid;

        // 지역
        const adminDocRef = doc(firebaseDB, "admin", currentUserId);
        const adminDocSnap = await getDoc(adminDocRef);

        if (adminDocSnap.exists()) {
          const adminMaster = adminDocSnap.data().master;
          const adminCommunity = adminDocSnap.data().community;

          // 유저
          const q = query(collection(firebaseDB, "mission"));
          const querySnapshot = await getDocs(q);

          for (var i in querySnapshot.docs) {
            const doc = querySnapshot.docs[i].data();
            const docCommunity = doc.community;

            if (adminMaster == true) {
              const missionObject = { index: parseInt(i) + 1, ...doc };
              setMissionList((currentList) => [...currentList, missionObject]);
            } else {
              if (docCommunity == adminCommunity) {
                let count = 0;
                const communityMissionObject = { index: count, ...doc };
                setMissionList((currentList) => [
                  ...currentList,
                  communityMissionObject,
                ]);
                count++;
              }
            }
          }
          setLoading(true);
        }
      }
    });
  }

  useEffect(() => {
    setMissionList([]);
    getMissionData();
  }, [clickRegion]);

  const MissionTableRow = (item) => {
    var eventPeriod = `${item.startPeriod} - ${item.endPeriod}`;

    return (
      <tr key={item.index}>
        <td>{parseInt(item.index)}</td>
        <td>{item.title}</td>
        <td>{item.community}</td>
        <td>{eventPeriod}</td>
        <td>
          <span
            style={{
              backgroundColor:
                item.state == "진행" ? "rgba(255, 252, 127, 0.8)" : null,
              fontWeight: item.state == "진행" ? 600 : 400,
              color: item.state == "진행" ? `${colors.mainColor}` : "black",
            }}
          >
            {item.state}
          </span>
        </td>
        <td style={{ display: "flex", justifyContent: "center" }}>
          <FontAwesomeIcon
            icon={faRightToBracket}
            style={{ color: colors.subMainColor, cursor: "pointer" }}
            onClick={() => detailEventPage(item.documentId)}
          />
        </td>
      </tr>
    );
  };

  const detailEventPage = (eventId) => {
    navigate(`${eventId}`);
  };

  return (
    <>
      <ReactHelmet title={"행사 관리"} />
      <Outlet />
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
              justifyContent: "flex-end",
              marginBottom: "30px",
              alignItems: "flex-start",
            }}
          >
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
                filename={"오늘도청춘 행사 정보"}
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
                    <th style={{ width: "40%" }}>행사</th>
                    <th style={{ width: "15%" }}>주최기관</th>
                    <th style={{ width: "20%" }}>기간</th>
                    <th style={{ width: "5%" }}>상태</th>
                    <th
                      style={{
                        width: "10%",
                        textAlign: "center",
                      }}
                    >
                      세부 보기
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? missionList.map((item) => MissionTableRow(item))
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
      </div>
    </>
  );
}

export default Event;

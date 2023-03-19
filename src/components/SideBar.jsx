import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
  CDBIcon,
} from "cdbreact";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import colors from "../colors";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import {
  faChartPie,
  faRankingStar,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faEnvelopeOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import titleImage from "../assets/title_icon.png";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseDB } from "../initFirebase";

function SideBar({ changeRegion }) {
  let currentUserId;
  const { pathname } = useLocation();
  const [userMaster, setUserMaster] = useState(false);
  const [selectRegion, setSelectRegion] = useState("");

  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId = user.uid;

      const userDocRef = doc(firebaseDB, "admin", currentUserId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userDBRegion = userDocSnap.data().region;
        const userDBSmallRegion = userDocSnap.data().smallRegion;
        const userDBFullRegion = `${userDBRegion} ${userDBSmallRegion}`;
        setSelectRegion(userDBFullRegion);

        const userDBMaster = userDocSnap.data().master;
        setUserMaster(userDBMaster);
      }
    }
  });

  const dropDownClick = async (clickRegion) => {
    setSelectRegion(clickRegion);
    changeRegion(clickRegion);

    const userAdminRef = doc(firebaseDB, "admin", currentUserId);

    if (clickRegion == "전체") {
      setDoc(
        userAdminRef,
        { region: "전체", smallRegion: "" },
        { merge: true }
      );
    } else if (clickRegion == "경기도 수정구") {
      setDoc(
        userAdminRef,
        { region: "경기도", smallRegion: "수정구" },
        { merge: true }
      );
    } else if (clickRegion == "서울특별시 광진구") {
      setDoc(
        userAdminRef,
        { region: "서울특별시", smallRegion: "광진구" },
        { merge: true }
      );
    }
  };

  return (
    <div
      style={{
        zIndex: 999,
        left: 0,
        position: "fixed",
        display: "flex",
        with: "100%",
        height: "100vh",
        overflow: "scroll initial",
        flexDirection: "column",
      }}
    >
      <CDBSidebar
        textColor="#fff"
        backgroundColor={colors.menuBlack}
        maxWidth="240px"
      >
        <div
          id="sidebar-header"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "start",
            borderBottom: "1px solid",
            borderColor: "rgba(255, 255, 255, 0.1)",
            padding: "20px",
          }}
        >
          <img src={titleImage} style={{ width: 140 }} />
          <div className="dropdown-box">
            <DropdownButton title={selectRegion} id="region-dropdown">
              <Dropdown.Item
                onClick={() => dropDownClick("전체")}
                id="region-dropdown-item"
                key="total"
                disabled={userMaster == true ? false : true}
              >
                전체
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => dropDownClick("경기도 수정구")}
                id="region-dropdown-item"
                key="sujeong"
                disabled={
                  userMaster == true || selectRegion == "경기도 수정구"
                    ? false
                    : true
                }
              >
                경기도 수정구
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => dropDownClick("서울특별시 광진구")}
                id="region-dropdown-item"
                key="gwangjin"
                disabled={
                  userMaster == true || selectRegion == "서울특별시 광진구"
                    ? false
                    : true
                }
              >
                서울특별시 광진구
              </Dropdown.Item>
            </DropdownButton>
          </div>
        </div>

        <CDBSidebarContent
          id="sidebar-content"
          className="sidebar-content"
          style={{ position: "relative" }}
        >
          <CDBSidebarMenu>
            <NavLink to="/summary">
              <CDBSidebarMenuItem
                style={{
                  color: pathname == "/summary" ? colors.menuBlack : "#fff",
                  backgroundColor:
                    pathname == "/summary" ? "#fff" : colors.menuBlack,
                  borderRadius: pathname == "/summary" ? "3px" : null,
                }}
              >
                <FontAwesomeIcon
                  style={{
                    fontSize: pathname == "/summary" ? 25 : 20,
                    width: pathname == "/summary" ? 27 : 25,
                    transition: "font-size 5s",
                  }}
                  icon={faChartPie}
                />
                <span class="m-4">개요</span>
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink to="/users">
              <CDBSidebarMenuItem
                style={{
                  color: pathname == "/users" ? colors.menuBlack : "#fff",
                  backgroundColor:
                    pathname == "/users" ? "#fff" : colors.menuBlack,
                  borderRadius: pathname == "/users" ? "3px" : null,
                }}
              >
                <FontAwesomeIcon
                  style={{
                    fontSize: pathname == "/users" ? 25 : 20,
                    width: pathname == "/users" ? 27 : 25,
                    transition: "font-size 5s",
                  }}
                  icon={faUser}
                />
                <span class="m-4">회원 관리</span>
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink to="/ranks">
              <CDBSidebarMenuItem
                style={{
                  color: pathname == "/ranks" ? colors.menuBlack : "#fff",
                  backgroundColor:
                    pathname == "/ranks" ? "#fff" : colors.menuBlack,
                  borderRadius: pathname == "/ranks" ? "3px" : null,
                }}
              >
                <FontAwesomeIcon
                  style={{
                    fontSize: pathname == "/ranks" ? 25 : 20,
                    width: pathname == "/ranks" ? 27 : 25,
                    transition: "font-size 5s",
                  }}
                  icon={faRankingStar}
                />
                <span class="m-4">순위 정보</span>
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink to="/service">
              <CDBSidebarMenuItem
                style={{
                  color: pathname == "/service" ? colors.menuBlack : "#fff",
                  backgroundColor:
                    pathname == "/service" ? "#fff" : colors.menuBlack,
                  borderRadius: pathname == "/service" ? "3px" : null,
                }}
              >
                <FontAwesomeIcon
                  style={{
                    fontSize: pathname == "/service" ? 25 : 20,
                    width: pathname == "/service" ? 27 : 25,
                    transition: "font-size 5s",
                  }}
                  icon={faEnvelopeOpen}
                />
                <span class="m-4">피드백</span>
              </CDBSidebarMenuItem>
            </NavLink>
          </CDBSidebarMenu>
        </CDBSidebarContent>

        <CDBSidebarFooter
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <div
            className="sidebar-btn-wrapper"
            style={{ padding: "20px 5px", fontSize: "13px" }}
          >
            © 청춘온
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>
    </div>
  );
}

export default React.memo(SideBar);

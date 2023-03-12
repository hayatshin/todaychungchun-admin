import { faSadTear } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import colors from "../colors";

function NotLoggedIn() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <FontAwesomeIcon
        style={{ fontSize: 50, marginBottom: 30, color: colors.mainColor }}
        icon={faSadTear}
      />
      <span style={{ fontSize: 15, fontWeight: 600, color: "black" }}>
        로그인 후 접속이 가능합니다.
      </span>
    </div>
  );
}
export default NotLoggedIn;

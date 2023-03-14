import { Form, Button, Image } from "react-bootstrap";
import titleImage from "../assets/title_icon.png";
import styled from "styled-components";
import { useEffect, useState } from "react";
import {
  browserSessionPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { firebaseAuth } from "../initFirebase";
import { useNavigate } from "react-router-dom";
import colors from "../colors";

const CustomImage = styled.img`
  width: 200px;
  margin-bottom: 30px;
`;

const FormBox = styled.div`
  width: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const CustomButton = styled.button`
  font-size: 16px;
  font-weight: 600;

  &:hover {
    color: white;
  }
`;

const BackDiv = styled.div`
  background-color: #f5f4f4;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

function SignIn({ changeMainCheck }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState({
    state: false,
    message: "",
  });
  const [passwordError, setPasswordError] = useState({
    state: false,
    message: "",
  });
  const renderErrorMessage = (message) => {
    return (
      <Form.Text style={{ fontSize: 12, color: colors.mainColor }}>
        {message}
      </Form.Text>
    );
  };

  changeMainCheck(false);

  // useEffect(() => {
  //   changeLoggedInState(false);
  // }, []);

  const validateForm = () => {
    return email.length > 0 && password.length > 0;
  };

  const emailTyping = (emailEvent) => {
    setEmail(emailEvent.target.value);

    if (emailEvent.target.value.length == 0)
      setEmailError({ state: false, message: "" });
  };

  const passwordTyping = (passwordEvent) => {
    setPassword(passwordEvent.target.value);

    if (passwordEvent.target.value.length == 0)
      setPasswordError({ state: false, message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (email.length == 0) {
      setEmailError({ state: true, message: "이메일을 입력해주세요" });
    } else setEmailError({ state: false, message: "" });

    if (password.length == 0) {
      setPasswordError({ state: true, message: "비밀번호를 입력해주세요." });
    } else setPasswordError({ state: false, message: "" });

    // 파이어베이스 auth

    await signInWithEmailAndPassword(firebaseAuth, email, password)
      .then((userCredential) => {
        // signed in
        const user = userCredential.user;
        navigate("/summary");

        // const loggedAuth = getAuth();
        // const loggedUser = loggedAuth.currentUser.uid;

        // window.sessionStorage.setItem(loggedUser, "login");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (
          errorCode == "auth/user-not-found" ||
          errorCode == "auth/invalid-email"
        ) {
          setEmailError({
            state: true,
            message: "존재하지 않는 이메일입니다.",
          });
        } else if (errorCode == "auth/wrong-password") {
          setPasswordError({
            state: true,
            message: "잘못된 비밀번호입니다.",
          });
        }
      });
  };

  return (
    <BackDiv>
      <div class="d-flex flex-column justify-content-center align-items-center w-75">
        <CustomImage src={titleImage} />
        <form onSubmit={handleSubmit} style={{ width: "250px" }}>
          <Form.Group className="mb-1 w-100" controlId="formBasicEmail">
            <Form.Control
              style={{ fontSize: "13px" }}
              type="text"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(e) => emailTyping(e)}
            />
            {emailError.state && renderErrorMessage(emailError.message)}
          </Form.Group>
          <Form.Group className="mb-2 w-100" controlId="formBasicPassword">
            <Form.Control
              style={{ fontSize: "13px" }}
              type="password"
              placeholder="비밀번호를 입력해주세요"
              onChange={(e) => passwordTyping(e)}
            />
            {passwordError.state && renderErrorMessage(passwordError.message)}
          </Form.Group>
          {/* <Form.Group
            className="mb-2 d-flex align-self-start"
            controlId="formBasicCheckbox"
          >
            <Form.Check
              style={{ fontSize: "14px" }}
              type="checkbox"
              label="아이디 기억하기"
            />
          </Form.Group> */}
          <CustomButton
            variant="primary"
            type="submit"
            className="w-100 btn mt-4 btn-outline-primary"
            disabled={!validateForm()}
          >
            로그인
          </CustomButton>
        </form>
      </div>
    </BackDiv>
  );
}
export default SignIn;

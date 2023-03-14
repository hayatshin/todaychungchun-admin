import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { createRef, useCallback, useState } from "react";
import { CSVLink } from "react-csv";
import colors from "../colors";
import SideBar from "../components/SideBar";
import { faFilePdf as PDFOutlined } from "@fortawesome/free-regular-svg-icons";
import { faFilePdf as PDFFilled } from "@fortawesome/free-solid-svg-icons";
import ReactApexChart from "react-apexcharts";
import ReactToPdf from "react-to-pdf";
import ReactHelmet from "../components/ReactHelmet";

function Summary({ changeMainCheck, clickRegion }) {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [csvHover, setCsvHover] = useState(false);

  changeMainCheck(true);

  const pdfRef = createRef();

  let splineState = {
    series: [
      {
        name: "series1",
        data: [31, 40, 28, 51, 42, 109, 100],
      },
      {
        name: "series2",
        data: [11, 32, 45, 32, 34, 52, 41],
      },
    ],
    options: {
      chart: {
        // height: 300,
        type: "area",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        type: "datetime",
        categories: [
          "2018-09-19T00:00:00.000Z",
          "2018-09-19T01:30:00.000Z",
          "2018-09-19T02:30:00.000Z",
          "2018-09-19T03:30:00.000Z",
          "2018-09-19T04:30:00.000Z",
          "2018-09-19T05:30:00.000Z",
          "2018-09-19T06:30:00.000Z",
        ],
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
    },
  };

  let pieState = {
    series: [44, 55, 41, 17, 15],
    options: {
      chart: {
        type: "donut",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };

  let lineColumnState = {
    series: [
      {
        name: "Website Blog",
        type: "column",
        data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160],
      },
      {
        name: "Social Media",
        type: "line",
        data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16],
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
      },
      stroke: {
        width: [0, 4],
      },
      title: {
        text: "Traffic Sources",
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [1],
      },
      labels: [
        "01 Jan 2001",
        "02 Jan 2001",
        "03 Jan 2001",
        "04 Jan 2001",
        "05 Jan 2001",
        "06 Jan 2001",
        "07 Jan 2001",
        "08 Jan 2001",
        "09 Jan 2001",
        "10 Jan 2001",
        "11 Jan 2001",
        "12 Jan 2001",
      ],
      xaxis: {
        type: "datetime",
      },
      yaxis: [
        {
          title: {
            text: "Website Blog",
          },
        },
        {
          opposite: true,
          title: {
            text: "Social Media",
          },
        },
      ],
    },
  };

  return (
    <>
      <ReactHelmet title={"개요"} />
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
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 50,
          }}
        >
          <span
            style={{
              marginLeft: "240px",
              color: "white",
              fontWeight: 600,
              fontSize: 20,
              marginBottom: 5,
            }}
          >
            개요 페이지는 준비 중에 있습니다.
          </span>
          <span
            style={{
              marginLeft: "240px",
              color: "white",
              fontWeight: 600,
              fontSize: 20,
            }}
          >
            빠르게 서비스를 제공해드리겠습니다!
          </span>
        </div>

        {/* 실제 화면 */}
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
              ></div>
            </div>
            <ReactToPdf
              targetRef={pdfRef}
              filename="오늘도청춘 개요 파일"
              scale={0.6}
            >
              {({ toPdf }) => (
                <button
                  onClick={toPdf}
                  style={{
                    border: "none",
                    padding: 0,
                    background: "none",
                  }}
                  onMouseOver={() => setCsvHover(true)}
                  onMouseLeave={() => setCsvHover(false)}
                >
                  <div style={{ textDecoration: "none" }}>
                    <FontAwesomeIcon
                      style={{
                        fontSize: 24,
                        marginRight: 8,
                        color: colors.mainColor,
                      }}
                      icon={csvHover ? PDFFilled : PDFOutlined}
                    />
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: colors.mainColor,
                      }}
                    >
                      PDF 다운로드
                    </span>
                  </div>
                </button>
              )}
            </ReactToPdf>
          </div>

          {/* chart */}
          <div id="chart-box" ref={pdfRef}>
            <div id="top-grid-box">
              <ReactApexChart
                id="spline-linechart"
                options={splineState.options}
                series={splineState.series}
                type="area"
                height={250}
              />
              <ReactApexChart
                id="pie-chart"
                options={pieState.options}
                series={pieState.series}
                type="donut"
                height={250}
              />
            </div>
            <ReactApexChart
              options={lineColumnState.options}
              series={lineColumnState.series}
              type="line"
              height={350}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Summary;

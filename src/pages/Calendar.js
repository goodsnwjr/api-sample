import React, { useState, useEffect, useCallback, useRef } from "react";
import { withRouter } from "react-router-dom";
import axios from 'axios';

// modules
import TUICalendar from "@toast-ui/react-calendar";
import { CopyToClipboard } from "react-copy-to-clipboard";

// css
import "tui-calendar/dist/tui-calendar.css";
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";

// actions
import {
  getList as getEventList,
  createEvent,
  updateEvent,
  deleteEvent,
  getListCount
} from "../store/actions/event";
import { getList as getCalenddarList } from "../store/actions/calendar";
import {
  Button,
  DatePicker,
  Descriptions,
  Input,
  message,
  Popconfirm,
  Switch,
  Modal,
  Divider,
  Card,
  Row,
  Col,
} from "antd";
import { CopyOutlined, RightOutlined, LeftOutlined } from "@ant-design/icons";
import moment from "moment";

import "../assets/style/calendar.css";
import { getNowYMD } from "../lib/utils";

const color = {
  ACTIVE: "#1890ff",
  INACTIVE: "#dddddd",
};

function Calendar(props) {
  const [schedules, setEventList] = useState(null);
  const [calendars, setCalenddarList] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editmode, setEditmode] = useState(false);
  const [dateRange, setDateRange] = useState(["", ""]);
  const [dashboard, setDashboard] = useState({total : 0, active: 0, inactive: 0});
  const cal = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const _cl = await getCalenddarList();
        setCalenddarList(_cl);

        const _ev = await getEventList();
        setEventList(
          _ev.map((x) => ({
            ...x,
            bgColor: x.state === "active" ? color.ACTIVE : color.INACTIVE,
          }))
        );
      } catch (e) {
        console.log(e);
      }
    }

    fetchData();

    getDashboard()
  }, []);

  const closeModal = useCallback(() => {
    setSelectedSchedule(null);
    setEditmode(false);
  }, []);

  const onClickSchedule = (e) => {
    const target = schedules.find((x) => x.id === e.schedule.id) || {};
    setSelectedSchedule({ ...target, ...e.schedule });
  };

  const onAfterRenderSchedule = (e) => {
    if (cal.current) {
      const inst = cal.current.getInstance();
      setDateRange([
        getNowYMD(inst.getDateRangeStart().toDate()),
        getNowYMD(inst.getDateRangeEnd().toDate()),
      ]);
    }
  };

  const onBeforeCreateSchedule = useCallback(async (scheduleData) => {
    try {
      let location = new Date().getTime();
      if (location > 4294967295) location = location.toString().substr(-10);
      else location = location.toString();
      const sd = {
        calendarId: scheduleData.calendarId,
        title: scheduleData.title,
        isAllDay: scheduleData.isAllDay,
        start: new Date(scheduleData.start.getTime()),
        end: new Date(scheduleData.end.getTime()),
        category: scheduleData.isAllDay ? "allday" : "time",
        dueDateClass: "",
        location,
        raw: {
          class: scheduleData.raw["class"],
        },
        state: scheduleData.state,
      };

      const _id = await createEvent(sd);
      setEventList((prev) => [...prev, { ...sd, id: _id }]);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const templates = {
    popupStateFree: function () {
      return "inactive";
    },
    popupStateBusy: function () {
      return "active";
    },
  };

  const editSchedule = (key, v) => {
    if (!selectedSchedule) return;
    setSelectedSchedule((prev) => ({ ...prev, [key]: v }));
  };

  const editMemo = e => {
    const v = e.target.value;
    setSelectedSchedule(prev => ({...prev, memo : v}))
  }

  const updateScheduleState = (v) => {
    if (!selectedSchedule) return;

    const targetStart = selectedSchedule.start.toDate(),
      targetEnd = selectedSchedule.end.toDate();

    // check limit
    const siblings = schedules.filter((x) => {
      const start = new Date(x.start),
        end = new Date(x.end);
      return start >= targetStart && end <= targetEnd && x.state === "active";
    });

    if (v && siblings.length >= 4) {
      message.info("예약 승인은 한 타임에 최대 4개까지만 가능합니다");
      return;
    }

    const _v = v ? "active" : "inactive";
    updateEvent(selectedSchedule.id, { state: _v }).then((res) => {
      message.destroy();
      message.success(v ? "승인되었습니다" : "승인이 취소되었습니다");
      editSchedule("state", res.state);
      setEventList((prev) => {
        let _prev = [...prev];
        const target = _prev.findIndex((x) => x.id === selectedSchedule.id);
        if (target > -1) {
          _prev[target].state = _v;
          _prev[target].bgColor = v ? color.ACTIVE : color.INACTIVE;
        }
        return _prev;
      });
    });
  };

  const updateScheduleMemo = () => {
    if(!selectedSchedule?.id) return;
    updateEvent(selectedSchedule.id, {
      memo : selectedSchedule.memo
    }).then(res => {
      message.destroy();
      message.success('메모를 저장했습니다');
      setEventList((prev) => {
        let _prev = [...prev];
        const target = _prev.findIndex((x) => x.id === selectedSchedule.id);
        if (target > -1) {
          _prev[target].memo = res.memo
        }
        return _prev;
      });
    })
  }

  const updateEventByState = () => {
    const { id, title, start, end, memo } = selectedSchedule;
    updateEvent(id, {
      title,
      start: start.toDate(),
      end: end.toDate(),
      memo : memo
    }).then((res) => {
      message.success("일정이 수정되었습니다");
      setEventList((prev) => {
        let newEventList = [...prev];
        const target = prev.findIndex((x) => x.id === id);
        if (target > -1) {
          newEventList[target].title = title;
          newEventList[target].start = start.toDate();
          newEventList[target].end = end.toDate();
        }
        return newEventList;
      });
      closeModal();
    });
  };

  const deleteSchedule = () => {
    if (!selectedSchedule) return;
    deleteEvent(selectedSchedule.id).then(() => {
      message.success("일정을 삭제했습니다");
      setEventList((prev) => {
        let newEventList = [...prev];
        const target = prev.findIndex((x) => x.id === selectedSchedule.id);
        if (target > -1) {
          newEventList.splice(target, 1);
        }
        return newEventList;
      });
      closeModal();
    });
  };

  const moveWeek = (type) => {
    if (cal.current) {
      const inst = cal.current.getInstance();
      inst[type]();
      setDateRange([
        getNowYMD(inst.getDateRangeStart().toDate()),
        getNowYMD(inst.getDateRangeEnd().toDate()),
      ]);
    }
  };

  const getDashboard = async () => {
    const total = await getListCount({buyerId : {exists : true}}),
    active = await getListCount({buyerId : {exists : true}, state: 'active'}),
    inactive = await getListCount({buyerId : {exists : true}, state: {neq: 'active'}});
    setDashboard({
      total, active, inactive
    })
  }

  return (
    <div className="App" style={{padding: 15}}>
      <Row gutter={15}>
        <Col span={8}>
          <Card size="small" style={{textAlign: 'center'}}>
            <div>승인</div>
            <div style={{fontSize: 25, fontWeight: 'bold', color: '#1890ff'}}>
              {dashboard.active}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{textAlign: 'center'}}>
            <div>미승인</div>
            <div style={{fontSize: 25, fontWeight: 'bold', opacity: 0.5}}>
              {dashboard.inactive}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{textAlign: 'center'}}>
            <div>합계</div>
            <div style={{fontSize: 25, fontWeight: 'bold'}}>
              {dashboard.total}
            </div>
          </Card>
        </Col>
      </Row>
      <Card title="일정" style={{marginTop: 15}} extra={
        <div className="calendar-header">
          <span style={{ fontWeight: "bold", marginRight: 15, fontSize: 18 }}>
            <span>{dateRange[0]}</span> ~<span>{dateRange[1]}</span>
          </span>
          <Button
            shape="circle"
            icon={<LeftOutlined />}
            onClick={() => moveWeek("prev")}
            data-value="prev"
          />
          <Button
            shape="circle"
            icon={<RightOutlined />}
            onClick={() => moveWeek("next")}
            data-value="next"
          />
        </div>
      }>

      <TUICalendar
        ref={cal}
        height="100vh"
        usageStatistics={false}
        useCreationPopup={true}
        useDetailPopup={false}
        template={templates}
        calendars={calendars}
        schedules={schedules}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        onAfterRenderSchedule={onAfterRenderSchedule}
      />
      </Card>
      <Modal
        onCancel={closeModal}
        visible={!!selectedSchedule}
        title={selectedSchedule?.title}
        footer={[
          <div
            key="footer"
            style={{
              display: "flex",
              width: "100%",
              justifyContent: editmode ? "flex-end" : "space-between",
            }}
          >
            {!editmode ? (
              <>
                <div>
                  <Button onClick={() => setEditmode(true)}>수정</Button>
                  <Popconfirm
                    title="일정을 삭제할까요?"
                    onConfirm={deleteSchedule}
                  >
                    <Button type="danger">삭제</Button>
                  </Popconfirm>
                   <Popconfirm
                    title="회의를 강제로 중지할까요?"
                    onConfirm={() => {
                      axios.post('https://sfw-api.ifdev.cc/api/cmds/dismissroomBySessionId', {
                        sessionId: Number(selectedSchedule?.location)
                      }, {
                        'headers' : {
                          'Accept' : 'application/json',
                        }
                      });
                    }}
                  >
                    <Button type="danger" ghost>회의 강제 중지</Button>
                  </Popconfirm>
                </div>
                <Button
                  type="primary"
                  href={
                    "https://sfw-client.ifdev.cc/?roomId=" +
                    selectedSchedule?.location
                  }
                  target="_blank"
                >
                  회의 시작
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setEditmode(false)}>취소</Button>
                <Button type="primary" onClick={updateEventByState}>
                  확인
                </Button>
              </>
            )}
          </div>,
        ]}
        width={700}
      >
        {selectedSchedule && (
          <>
            <Descriptions bordered size="small" column={2} title="일정">
              <Descriptions.Item label="이름">
                <Input
                  value={selectedSchedule.title}
                  onChange={(e) => editSchedule("title", e.target.value)}
                  disabled={!editmode}
                />
              </Descriptions.Item>
              <Descriptions.Item label="승인 여부">
                <Switch
                  checked={selectedSchedule.state === "active"}
                  onChange={updateScheduleState}
                />
              </Descriptions.Item>
              <Descriptions.Item label="시작">
                <DatePicker
                  showTime
                  value={moment(selectedSchedule.start.toDate())}
                  onChange={(v) => editSchedule("start", v)}
                  disabled={!editmode}
                />
              </Descriptions.Item>
              <Descriptions.Item label="종료">
                <DatePicker
                  showTime
                  value={moment(selectedSchedule.end.toDate())}
                  onChange={(v) => editSchedule("end", v)}
                  disabled={!editmode}
                />
              </Descriptions.Item>
              
              <Descriptions.Item label="url" span={2}>
                <div style={{ fontSize: "12px" }}>
                  {"https://sfw-client.ifdev.cc/?roomId=" +
                    selectedSchedule?.location}
                  <CopyToClipboard
                    text={
                      "https://sfw-client.ifdev.cc/?roomId=" +
                      selectedSchedule?.location
                    }
                    onCopy={() => message.info("복사하였습니다")}
                  >
                    <CopyOutlined />
                  </CopyToClipboard>
                  <Button size="small" target="_blank" style={{marginLeft: 5}} href={
                    "https://sfw-client.ifdev.cc/?roomId=" +
                    selectedSchedule?.location
                  }>바로가기</Button>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={<div>메모<br /><Button size="small" onClick={updateScheduleMemo}>저장</Button></div>}>
                <Input.TextArea value={selectedSchedule.memo} onChange={editMemo} style={{height: 150}} />
              </Descriptions.Item>
            </Descriptions>


            {selectedSchedule.buyer && (
              <>
                <Divider />
                <Descriptions
                  title="브랜드 정보"
                  bordered
                  size="small"
                  column={2}
                >
                  <Descriptions.Item label="이름">
                    {selectedSchedule.buyer.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="직함">
                    {selectedSchedule.buyer.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="국가">
                    {selectedSchedule.buyer.country}
                  </Descriptions.Item>
                  <Descriptions.Item label="회사명">
                    {selectedSchedule.buyer.companyName}
                  </Descriptions.Item>
                  <Descriptions.Item label="연락처">
                    {selectedSchedule.buyer.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="이메일">
                    {selectedSchedule.buyer.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="취급복종">
                    {selectedSchedule.buyer.items}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

export default withRouter(Calendar);

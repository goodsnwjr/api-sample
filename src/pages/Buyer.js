import React, { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  Switch,
  message,
  Card,
  Button,
  Descriptions,
  Popconfirm,
  Input,
  Select,
} from "antd";
import { RedoOutlined } from "@ant-design/icons";

import { getList, update, remove } from "../store/actions/account";

import moment from "moment";
import Modal from "antd/lib/modal/Modal";

const keyVal = {
  name: "이름",
  phone: "연락처",
  email: "이메일",
  companyName: "회사명",
  items: "취급 의류 종목",
  created: "생성일",
  country: "국가",
  wechatId: "위챗ID",
  title: "직함",
  companyDesc: "회사소개",
};

const errHandler = () => {
  message.error("잠시 후 다시 시도해주세요.");
};

const tableColumns = [
  {
    title: "명함",
    dataIndex: "card",
    render: (img) =>
      !img ? null : <img src={img} alt="" style={{ width: "100px" }} />,
  },
  {
    title: keyVal["name"],
    dataIndex: "name",
  },
  {
    title: keyVal["phone"],
    dataIndex: "phone",
  },
  {
    title: keyVal["email"],
    dataIndex: "email",
  },
  {
    title: keyVal["companyName"],
    dataIndex: "companyName",
  },
  {
    title: keyVal["items"],
    dataIndex: "items",
  },
  {
    title: keyVal["created"],
    dataIndex: "created",
    render: (created) =>
      created ? moment(created).format("YYYY-MM-DD HH:mm:ss") : "",
  },
];

const PAGE_SIZE = 10;
function Buyer() {
  const { list, total } = useSelector((state) => state.account);
  const dispatch = useDispatch();

  const [detailVisible, setDetailVisible] = useState(false);
  const [where, setWhere] = useState({});
  const [searchType, setSearchType] = useState("name");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const onChangeActive = useCallback(
    (checked, user) => {
      dispatch(
        update({
          id: user.id,
          active: checked,
        })
      )
        .then(() => {
          message.success("유저 정보를 수정했습니다.");
        })
        .catch(errHandler);
    },
    [dispatch]
  );

  const deleteBuyer = (user) => {
    if (!user.id) return;
    dispatch(remove(user.id));
  };

  const resetSearch = useCallback(() => {
    setPage(1);
    setSearchType("name");
    setKeyword("");
    setWhere();
  }, []);

  useEffect(() => {
    dispatch(
      getList({
        condition: where,
        order: "created DESC",
        page: page,
        size: PAGE_SIZE,
      })
    );
  }, [where, page, dispatch]);

  return (
    <div style={{ padding: 15 }}>
      <Card
        style={{
          marginBottom: 15,
        }}
      >
        <Input.Group>
          <Select
            value={searchType}
            style={{ width: 150 }}
            onChange={setSearchType}
          >
            {["name", "phone", "companyName", "email", "wechatId", "items"].map(
              (k) => {
                return (
                  <Select.Option key={k} value={k}>
                    {keyVal[k]}
                  </Select.Option>
                );
              }
            )}
          </Select>
          <Input.Search
            value={keyword}
            style={{ width: "calc(100% - 220px)" }}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={(v) => setWhere({ searchType: searchType, keyword: v })}
          />
          <Button onClick={resetSearch}>
            <RedoOutlined />
          </Button>
        </Input.Group>
      </Card>
      <Card title="목록" extra={`총 ${total}명`}>
        <Table
          pagination={{
            current: page,
            total,
            pageSize: PAGE_SIZE,
            onChange: setPage,
          }}
          columns={[
            {
              title: 'No.', 
              dataIndex: '', 
              render: (_, record, i) => {
                const idx = (page - 1) * PAGE_SIZE;
                return total - (i + idx);
              }
            },
            ...tableColumns,
            {
              title: "action",
              dataIndex: "action",
              render: (_, user) => {
                return (
                  <>
                    <Button type="link" onClick={() => setDetailVisible(user)}>
                      상세보기
                    </Button>
                    <Popconfirm
                      title="바이어를 삭제합니다"
                      onConfirm={() => deleteBuyer(user)}
                    >
                      <Button type="link" style={{ color: "red" }}>
                        삭제
                      </Button>
                    </Popconfirm>
                  </>
                );
              },
            },
            {
              title: "승인",
              dataIndex: "active",
              render: (active, user) => (
                <Switch
                  checked={!!active}
                  onChange={(checked) => onChangeActive(checked, user)}
                />
              ),
            },
          ]}
          dataSource={list}
          rowKey="id"
        />
      </Card>
      <Modal
        width={600}
        onCancel={() => setDetailVisible(false)}
        visible={!!detailVisible}
        title="바이어 정보"
        footer={null}
      >
        {detailVisible?.card && (
          <img
            style={{
              maxWidth: "100%",
              maxHeight: 200,
              display: "block",
              margin: "0 auto 30px",
            }}
            src={detailVisible.card}
            alt=""
          />
        )}
        {detailVisible?.id && (
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label={keyVal["name"]} span={2}>
              {detailVisible.name}
            </Descriptions.Item>

            <Descriptions.Item label={keyVal["country"]}>
              {detailVisible.country}
            </Descriptions.Item>
            <Descriptions.Item label={keyVal["wechatId"]}>
              {detailVisible.wechatId}
            </Descriptions.Item>

            <Descriptions.Item label={keyVal["phone"]} span={2}>
              {detailVisible.phone}
            </Descriptions.Item>

            <Descriptions.Item label={keyVal["email"]} span={2}>
              {detailVisible.email}
            </Descriptions.Item>

            <Descriptions.Item label={keyVal["companyName"]}>
              {detailVisible.companyName}
            </Descriptions.Item>
            <Descriptions.Item label={keyVal["title"]}>
              {detailVisible.title}
            </Descriptions.Item>

            <Descriptions.Item label={keyVal["companyDesc"]} span={2}>
              {detailVisible.companyDesc}
            </Descriptions.Item>

            <Descriptions.Item label={keyVal["items"]} span={2}>
              {detailVisible.items}
            </Descriptions.Item>

            <Descriptions.Item label="승인" span={2}>
              <Switch
                checked={!!detailVisible.active}
                onChange={(checked) => onChangeActive(checked, detailVisible)}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default Buyer;

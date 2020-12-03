// base
import React, { Component } from 'react';

// utils
// modules
import { Form, Input, Button, Card, Col, Row, Layout, Spin, notification } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoadingOutlined
} from '@ant-design/icons';

// actions
import { Login } from '../../store/actions/account';

// assets
import login_bg from '../../assets/login/imform_logo.png';
import login_tit from '../../assets/login/imform_logo.png';
import logo from '../../assets/login/imform_logo.png';
import imform_logo from '../../assets/login/imform_logo.png'

// define
const { Header, Content, Footer } =  Layout;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

class LoginPage extends Component {
  state = {
    loading: false
  };

  render() {
    return (
      <Layout style={{ height : '100vh' }}>
      <Header style={{ background: '#f2f2f2' }}>
        <img src={ logo } alt="logo" />
      </Header>
      <Content style={{background: '#eaeaea'}}>
        <Card
          style={{
            width: '850px',
            height : '512px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          bodyStyle={{
            height : '100%',
            padding : 0
          }}
        >
          <Row
            type="flex"
            justify="space-between"
            align='middle'
            style={{
              height : '100%',
              boxShadow: '0px 2px 38px 0 rgba(56, 56, 56, 0.34)'
            }}
            >
            <Col span={12}>
                <img
                  src={ login_tit }
                  style={{
                    position: 'absolute',
                    top: '200px',
                    zIndex: '10',
                    left: '120px',
                  }}
                  alt="logo"
                />
                <img src={ login_bg } alt="bg" />
            </Col>
            <Col span={12}>
              { this.state.loading &&
                <div style={{ margin: '120px'}}>
                  <Spin indicator={antIcon} />
                </div>
              }
              { !this.state.loading &&
              <Form
                {...layout}
                name="login"
                onFinish={ async (values) => {
                  this.setState({
                    loading: true
                  });

                  try {
                    await Login(values.username, values.password);
                  } catch (e) {
                    notification.open({
                      message: '에러 발생',
                      description: '로그인 정보가 잘못되었습니다. 다시 확인해주세요'
                    });
                    this.setState({
                      loading: false
                    });
                  }
                }}
              >
                <Form.Item
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your username!',
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="아이디"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your password!',
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder="비밀번호"
                  />
                </Form.Item>
                <Form.Item >
                  <Button
                    type="primary"
                    size="large"
                    style={{ width: '100%' }}
                    htmlType="submit"
                  >
                    로그인
                  </Button>
                </Form.Item>
              </Form>
            }
            </Col>
          </Row>
        </Card>
        </Content>
        <Footer style={{ textAlign: 'right', background: '#eaeaea' }}>
          <img src={ imform_logo } alt="logo" />
        </Footer>
      </Layout>
    );
  }
}

export default (LoginPage);

import React, { useState, useEffect } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';

//antd
import { Layout, Menu, Modal, Button } from 'antd';
import {
  LogoutOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

// utils
import { isEmpty, isLoggedIn } from './lib/utils';

// pages
import * as pages from './pages';

// action
import { getProfile, Logout } from './store/actions/account';

// defien
const { Content, Sider } = Layout;
const { confirm } = Modal;

function App(props) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const _profile = await getProfile();
        setProfile(_profile);
      } catch (e) {
        console.log(e);
      }
    }

    fetchData();
  }, []);

  if (!isLoggedIn()) {
    return (
      <Switch>
        <Route from="*" render={() => <pages.LoginPage />} />
      </Switch>
    );
  }

  if (isEmpty(profile)) {
    return <div />;
  }

  function showConfirm() {
    confirm({
      title: profile.email.split('@')[0] + '계정을 로그아웃 하시겠습니까?',
      icon: <ExclamationCircleOutlined />,
      content: '',
      okText: '로그아웃',
      cancelText: '취소',
      onOk() {
        Logout();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  const goTo = ({ key }) => {
    props.history.push(key);
  };

  return (
    <Layout>
      <Sider
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
        }}
      >
        <div style={{ color: 'white', padding: '20px 20px 20px' }}>
          <Button
            icon={<LogoutOutlined />}
            onClick={showConfirm}
            ghost
            style={{ width: '100%' }}
          >
            로그아웃
          </Button>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[props.location.pathname]}
          onClick={goTo}
        >
          <Menu.Item key="/" icon={<CalendarOutlined />}>
            상담 일정
          </Menu.Item>
          {!profile.isBuyer && (
            <Menu.Item key="/buyer" icon={<CalendarOutlined />}>
              바이어 관리
            </Menu.Item>
          )}
        </Menu>
      </Sider>
      <Layout className="site-layout" style={{ marginLeft: 200 }}>
        <Content style={{ margin: '0', overflow: 'initial' }}>
          <Switch>
            <Route
              exact
              path="/"
              component={() => <pages.Calendar profile={profile} />}
            />
            {!profile.isBuyer && (
              <Route exact path="/buyer" component={() => <pages.Buyer />} />
            )}
          </Switch>
        </Content>
      </Layout>
    </Layout>
  );
}

export default withRouter(App);

import React from 'react';
import { List, WhiteSpace, Checkbox, Button, NavBar, Icon, InputItem } from 'antd-mobile';
import 'antd-mobile/dist/antd-mobile.css';

import User from '../service/user-service.jsx'
import LocalStorge from '../util/LogcalStorge.jsx';
import HttpService from '../util/HttpService.jsx';
const _user = new User();


const localStorge = new LocalStorge();


export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      UserCode: '',
      Pwd: '',
    }
  }
  // componentWillMount() {
  //   document.title = '登录 - w';
  // }


  // 当用户名发生改变
  onInputChange(name, value) {
    //alert(e);

    this.setState({
      [name]: value
    });
    //console.log(inputName + ":" + inputValue);
  }
  onInputKeyUp(e) {
    if (e.keyCode === 13) {
      this.onSubmit();
    }
  }
  // 当用户提交表单
  onSubmit() {
    const loginInfo = {
      UserCode: this.state.UserCode,
      Pwd: this.state.Pwd,// "KfTaJa3vfLE=",
      import: "1",
      isAdmin: "1"
    }
    const checkResult = _user.checkLoginInfo(loginInfo);
    checkResult.states = true;
    // 验证通过
    if (checkResult.status) {

      HttpService.post('/reportServer/user/encodePwd', loginInfo.Pwd)
        .then(response => {
          loginInfo.Pwd = response.encodePwd;
          HttpService.post('/reportServer/user/Reactlogin', JSON.stringify(loginInfo)).then(response => {
            if (undefined != response.data && null != response.data) {
              let datas = response.data;
              localStorge.setStorage('userInfo', datas);
              window.location.href = "#/Home";
            } else {
              localStorge.errorTips("登录失败，用户异常");
            }
          }).catch((error) => {
            localStorge.errorTips("登录失败，请检查用户名与密码");
          });
        }).catch((error) => {
          localStorge.errorTips("登录失败，密码加密失败");
        });
    }
    // 验证不通过
    else {
      localStorge.errorTips("登录失败，请检查用户名和密码");

    }
  }
  //界面渲染
  render() {
    return (
      <div >
        <NavBar
          mode="light"
          // icon={<Icon type="left" />}
          // onLeftClick={() => window.location.href = "#/"}
          rightContent={[
            <div onClick={() => {
              window.location.href = `#/Setting`
            }}>设置</div>
          ]}
        >
          登录系统
        </NavBar>
        <List style={{ marginTop: '150px' }}>
          <List.Item>
            <InputItem
              type="text"
              name="username"
              placeholder="输入用户名"
              clear
              onKeyUp={e => this.onInputKeyUp(e)}
              onChange={(v) => this.onInputChange('UserCode', v)}
            >用户:</InputItem>
          </List.Item>
          <List.Item>
            <InputItem
              type="password"
              name="password"
              placeholder="******"
              onKeyUp={e => this.onInputKeyUp(e)}
              onChange={v => this.onInputChange("Pwd", v)}
            >密码:</InputItem>
          </List.Item>
          <List.Item>
            <Button type="primary" onClick={() => { this.onSubmit() }} > 登录</Button><WhiteSpace />
          </List.Item>
        </List>
      </div>
    )
  }
}

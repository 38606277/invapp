import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, List, WhiteSpace, WingBlank, Checkbox, SwipeAction, Switch, NavBar, Icon, InputItem, Toast, Button, } from 'antd-mobile';
import { Widget, addResponseMessage, toggleWidget, dropMessages, addLinkSnippet, addUserMessage, renderCustomComponent } from 'react-chat-widget';
import 'antd-mobile/dist/antd-mobile.css';
import { createForm } from 'rc-form';
import LocalStorge from '../util/LogcalStorge.jsx';
const localStorge = new LocalStorge();

class Setting extends React.Component {

    componentDidMount() {
        let configInfo = localStorge.getStorage('configInfo');
        if (undefined != configInfo && null != configInfo && '' != configInfo) {
            this.props.form.setFieldsValue(configInfo);
        }

    }

    updateConfig() {
        console.log('updateConfigClick')
        let configInfo = this.props.form.getFieldsValue();
        localStorge.setStorage('configInfo', configInfo);
        window.location.href = "#/"
    }

    render() {
        const { getFieldProps } = this.props.form;
        return (
            <div>
                <NavBar
                    mode="light"
                    icon={<Icon type="left" />}
                    style={{ backgroundColor: 'rgb(79,188,242)', color: 'rgb(255,255,255)' }}
                    rightContent={[
                        <div onClick={() => {
                            this.updateConfig();
                        }}>确定</div>
                    ]}
                    onLeftClick={() => window.location.href = "#/"}
                >
                    <span style={{ color: 'white' }}>设置</span>
                </NavBar>

                <List renderHeader={() => '基础信息'}>
                    <InputItem
                        {...getFieldProps('hostname')}
                        clear
                        placeholder="请输入地址 如:192.168.10.12"
                        ref={el => this.autoFocusInst = el}
                    ><span style={{ fontSize: '15px' }}>
                            服务器地址
                        </span></InputItem>
                </List>

            </div >
        )
    }
}
export default createForm()(Setting);
/**
 * TabBar 组件
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { menuData } from '../../common/menu';
import 'antd-mobile/lib/tab-bar/style/index.css';
import 'antd-mobile/lib/badge/style/index.css';
import Styles from './index.less';
const pathName = window.location.href.split('#')[1] || '';
class WxTabBar extends PureComponent {
  state = {
    hidden: true
  }

  changeTab = (tab) => {
    this.setState({
      selectedTab: tab
    })
  }
  componentDidMount() {
    this.switchTable();
  }

  // 监听 props 的变化
  componentWillReceiveProps(nextProps) {
    this.switchTable();
  }

  switchTable() {
    let pathName = window.location.href.split('#')[1] || '';
    //let pathName = nextProps.location.pathname;
    console.log('pathName', pathName)
    if (pathName === '/Home' || pathName === '/') {
      this.setState({
        hidden: false,
        selectedTab: "Home" //pathName.substring(1)
      });
    } else if (pathName === '/Asset/AssetMapGaoDe') {
      this.setState({
        hidden: false,
        selectedTab: "AssetMap" //pathName.substring(1)
      });
    } else if (pathName === '/Asset/AssetList') {
      this.setState({
        hidden: false,
        selectedTab: "AssetList"
      });
    } else if (pathName === '/Asset/AssetAlarmList') {
      this.setState({
        hidden: false,
        selectedTab: "AssetAlarmList"
      });
    } else if (pathName === '/My') {
      this.setState({
        hidden: false,
        selectedTab: "My"
      });
    } else {
      if (pathName.indexOf("Query") != -1) {
        this.setState({
          hidden: false,
          selectedTab: "Query"
        });
      } else {
        this.setState({
          hidden: true
        });
      }
    }
  }


  render() {
    return (
      <div style={{ 'display': this.state.hidden ? 'none' : 'block' }} className={classNames({
        'am-tabs-tab-bar-wrap': true,
      }, Styles.appfooter)}>
        <div className="am-tab-bar-bar" style={{ backgroundColor: "white" }}>
          {
            menuData.map(item => (
              <div key={item.key} className="am-tab-bar-tab">
                <Link to={item.path} onClick={this.changeTab.bind(this, item.key)}>
                  <div className="am-tab-bar-tab-icon">
                    <span className="am-badge am-tab-bar-tab-badge tab-badge">
                      {
                        this.state.selectedTab === item.key ?
                          <div style={{ width: "22px", height: "22px", background: `url(${item.selectedIcon}) center center / 21px 21px no-repeat` }}></div>
                          :
                          <div style={{ width: "22px", height: "22px", background: `url(${item.icon}) center center / 21px 21px no-repeat` }}></div>
                      }
                      {/* <sup className="am-badge-text">1</sup> */}
                    </span>
                  </div>
                  <p className="am-tab-bar-tab-title" style={{ color: this.state.selectedTab === item.key ? item.tintColor : item.unselectedTintColor }}>{item.name}</p>
                </Link>
              </div>
            ))
          }
        </div>
      </div>
    )
  }
}

export default WxTabBar;

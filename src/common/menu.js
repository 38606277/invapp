/**
 * 菜单栏 数据
 */
// 主页
import home1 from '../assets/index.png'
import home2 from '../assets/index_on.png'
// 数据查询
import sort1 from '../assets/jifen.png'
import sort2 from '../assets/jifen_on.png'
//AI
import ai1 from '../assets/icon/ais.png'
import ai2 from '../assets/icon/ais_on.png'
// 聊天
import chart1 from '../assets/icon/chart.png'
import chart2 from '../assets/icon/chart_on.png'
// 我的
import me1 from '../assets/my.png'
import me2 from '../assets/my_on.png'
/** 
 * tabbar菜单
 */

const menuData = [
  {
    name: '主页',
    key: 'Home',
    path: '/Home',
    icon: home1,
    selectedIcon: home2,
    unselectedTintColor: "#949494",
    tintColor: "#33A3F4",
  },
  {
    name: '资产地图',
    key: 'AssetMap',
    path: '/Asset/AssetMapGaoDe',
    icon: sort1,
    selectedIcon: sort2,
    unselectedTintColor: "#949494",
    tintColor: "#33A3F4",
  },
  {
    name: '资产发现',
    key: 'AssetList',
    path: '/Asset/AssetList',
    icon: ai1,
    selectedIcon: ai2,
    unselectedTintColor: "#949494",
    tintColor: "#33A3F4",
  },
  {
    name: '资产预警',
    key: 'AssetAlarmList',
    path: '/Asset/AssetAlarmList',
    icon: chart1,
    selectedIcon: chart2,
    unselectedTintColor: "#949494",
    tintColor: "#33A3F4",
  },
  {
    name: '我的',
    key: 'My',
    path: '/My',
    icon: me1,
    selectedIcon: me2,
    unselectedTintColor: "#949494",
    tintColor: "#33A3F4",
  },
]

export {
  menuData
} 

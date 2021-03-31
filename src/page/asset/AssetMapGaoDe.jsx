import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, List, WhiteSpace, WingBlank, Checkbox, SwipeAction, Switch, NavBar, Icon, InputItem, Toast, Button, } from 'antd-mobile';
import { Widget, addResponseMessage, toggleWidget, dropMessages, addLinkSnippet, addUserMessage, renderCustomComponent } from 'react-chat-widget';
import AMapLoader from '@amap/amap-jsapi-loader';
import 'antd-mobile/dist/antd-mobile.css';
import HttpService from '../../util/HttpService.jsx';
import './AssetMapGaoDe.css';
const Item = List.Item;
const Brief = Item.Brief;

class AssetMapGaoDe extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lng: this.props.match.params.lng ? this.props.match.params.lng : 114.5220818442,
            lat: this.props.match.params.lat ? this.props.match.params.lat : 38.0489583146,
            actoinZoom: this.props.match.params.lng ? true : false,
            map: null,
            AMap: null,
            panelDisplay: 'none',
            gateway: {},
            assetList: [
            ],
            dataList: [],
            collapsed: false,
            listType: 'list',
            searchKeyword: null,
            cluster: null,
            markers: [],
            showDetailFromList: false,
            searchValue: '',
        }
    }

    componentDidMount() {
        this.init();
    }

    zoomend = () => {
        console.log('zoomend 当前等级', this.state.map.getZoom())
    }

    init = () => {
        console.log("初始位置：", this.state.lng, this.state.lat)
        //初始化地图
        AMapLoader.load({
            "key": "034f37e988d8a97079766539387a6a0b",   // 申请好的Web端开发者Key，首次调用 load 时必填
            // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            "plugins": ['AMap.MarkerClusterer']  //插件列表
        }).then((AMap) => {
            this.state.AMap = AMap;
            this.state.map = new AMap.Map('mapContainer', {
                center: [this.state.lng, this.state.lat],
                zoom: this.state.actoinZoom ? 12 : 7,// [3,19]
                resizeEnable: true,
            });

            this.loadGatewayList();
            //this.initMapData(map, AMap);
            this.state.map.on('zoomend', this.zoomend);


        }).catch(e => {
            console.log(e);
        })
    }

    /**
     * 获取网关数据
     */
    loadGatewayList() {
        let param = {};
        let _this = this;

        // 如果是搜索的话，需要传入搜索类型和搜索关键字
        let isSearch = this.state.listType === 'search'
        if (isSearch) {
            param.keyword = this.state.searchKeyword;
        }
        HttpService.post('reportServer/gateway/listEamGatewayByMap', JSON.stringify(param))
            .then(response => {
                if (response.resultCode == '1000') {
                    _this.setState({
                        dataList: response.data,
                        showDetail: false
                    });

                    //搜索后定位至第一个
                    if (0 < response.data.length) {
                        this.state.map.setZoom(10) // [3,19]
                        this.state.map.panTo(new AMap.LngLat(response.data[0].lng, response.data[0].rng));
                    }


                    _this.initMapData(_this.state.map, _this.state.AMap);

                    if (isSearch && _this.state.panelDisplay == 'none') {
                        _this.setState(
                            {
                                panelDisplay: 'block',
                            }
                        )
                    }
                } else {
                    addResponseMessage(response.message);
                }
            });
    }

    getAddr = (gateway) => {


        if (this.state.panelDisplay == 'none') {
            this.setState(
                {
                    panelDisplay: 'block',
                }
            )
        }//获取网关下的资产数据
        let param = { gateway_id: gateway.gateway_id };
        HttpService.post('reportServer/asset/listEamAssetByGatewayId', JSON.stringify(param)).then(response => {

            this.setState({
                gateway: gateway,
                assetList: response.data,
                showDetail: true,
            })
        }, errMsg => {
            localStorge.errorTips(errMsg);
        });
    }

    initMapData = (map, AMap) => {
        console.log('initMapData')
        map.clearMap();
        this.state.markers = [];
        let _this = this;
        for (var i = 0; i < this.state.dataList.length; i++) {
            // 创建一个 Marker 实例
            let gatewayItem = this.state.dataList[i];
            let marker = new AMap.Marker({
                position: new AMap.LngLat(gatewayItem.lng, gatewayItem.rng),   // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
                title: gatewayItem.address
            });

            marker.on('click', function (e) {
                _this.setState({
                    showDetailFromList: false,

                })

                //e.preventDefault(); // 修复 Android 上点击穿透
                _this.getAddr(gatewayItem);

            });


            // 将创建的点标记添加到已有的地图实例：
            //map.add(marker);

            this.state.markers.push(marker);

            if (this.state.cluster) {
                this.state.cluster.setMap(null);
            }
            if (this.state.listType === 'search') {
                this.state.cluster = new AMap.MarkerClusterer(map, this.state.markers, { gridSize: 60, maxZoom: 10 });
            } else {
                this.state.cluster = new AMap.MarkerClusterer(map, this.state.markers, { gridSize: 60, maxZoom: 18 });
            }


        }
    }

    onChange = (value) => {
        this.setState({ searchValue: value });
    };

    clear = () => {
        this.setState({ searchValue: '' });
    };


    // 搜索
    onSearch(searchKeyword) {
        let listType = searchKeyword === '' ? 'list' : 'search';
        this.setState({
            listType: listType,
            searchKeyword: searchKeyword
        }, () => {
            this.loadGatewayList();
        });
    }

    togglePanel = () => {
        if (this.state.panelDisplay != 'none') {
            this.setState(
                {
                    panelDisplay: 'none',
                }
            )
        } else {
            this.setState(
                {
                    panelDisplay: 'block',
                }
            )

        }
    }


    onGatewayItemClick = (gateway) => {
        this.setState({
            showDetailFromList: true
        })
        this.getAddr(gateway);
        let AMap = this.state.AMap;
        this.state.map.setZoom(13) // [3,19]
        this.state.map.panTo(new AMap.LngLat(gateway.lng, gateway.rng));

    }

    render() {
        return (
            <div>
                <NavBar
                    mode="light"
                    style={{ backgroundColor: 'rgb(79,188,242)', color: 'rgb(255,255,255)' }}
                >
                    <span style={{ color: 'white' }}>资产地图</span>
                </NavBar>
                <SearchBar
                    value={this.state.searchValue}
                    placeholder="搜索"
                    onSubmit={value => { this.onSearch(value) }}
                    onClear={value => console.log(value, 'onClear')}
                    onFocus={() => console.log('onFocus')}
                    onBlur={() => console.log('onBlur')}
                    onCancel={value => { this.onSearch(value) }}
                    cancelText="搜索"
                    showCancelButton
                    onChange={this.onChange}
                />

                <div id="mapContainer" style={{ height: (document.documentElement.clientHeight - 139 - (this.state.panelDisplay == 'none' ? 0 : document.documentElement.clientHeight * 0.45)) }}></div>


                <div style={{ display: this.state.panelDisplay, width: '100%', height: (document.documentElement.clientHeight * 0.45), position: 'fixed', zIndex: '1', bottom: '50px', backgroundColor: '#ffffff' }}>

                    <div style={{ padding: '15px', textAlign: 'center' }}>
                        {this.state.showDetail && this.state.showDetailFromList ? (<Icon style={{ float: 'left', lineHeight: "36px" }} type='left' onClick={() => { this.setState({ showDetail: false }) }} />) : (<span />)}
                        <span style={{ fontSize: '17px' }}> {this.state.showDetail ? `${this.state.gateway.gateway_name}详情` : "网关列表"}</span>
                        <Icon style={{ float: 'right', lineHeight: "36px" }} type='cross' onClick={() => { this.togglePanel() }} />
                    </div>


                    <div style={{ width: '100%', overflow: 'auto', height: (document.documentElement.clientHeight * 0.45 - 46) }}>

                        {this.state.showDetail ? (<List renderHeader={() => <div>

                            <a href={`#/asset/gatewayEdit/update/${this.state.gateway.gateway_id}`}>
                                {this.state.gateway.gateway_name}

                            </a>
                            <div style={{ marginTop: '5px' }}>{this.state.gateway.address}</div>
                            <div style={{ marginTop: '5px' }}>
                                经度:{this.state.gateway.lng} &nbsp;&nbsp;&nbsp;&nbsp; 纬度:{this.state.gateway.rng}
                            </div>

                        </div>} >
                            {this.state.assetList.map((item, index) => (
                                <Item key={index}>
                                    <div style={{ fontSize: '15px' }}>
                                        资产标签：{item.asset_tag}<br />
                                                                物联网标签：{item.iot_num}<br />
                                                                资产原值：{item.cost}<br />
                                                                资产净额：{item.netQuota}<br />
                                                                责任人：{item.dutyName}<br />
                                                                启用日期：{item.startDate}<br />
                                        {item.electricity != null &&
                                            (<div>电压：{item.electricity}V<br /></div>)
                                        }

                                        {item.receive_time != null &&
                                            (<div> 更新于：{item.receive_time}<br /></div>)
                                        }


                                    </div>
                                </Item>
                            ))}
                        </List>) : (<List  >
                            {this.state.dataList.map((item, index) => (
                                <Item key={index}>
                                    <div style={{ fontSize: '15px' }}>
                                        <a onClick={() => this.onGatewayItemClick(item)} style={{ color: '#3385ff' }}>
                                            {item.gateway_name}
                                        </a><br />
                                    网关编号：{item.gateway_id}<br />
            关联资产数：{item.assetCount}<br />
                                        {item.address}
                                    </div>
                                </Item>
                            ))}
                        </List>)}
                    </div>


                </div>

            </div >


        )
    }
}
export default AssetMapGaoDe;
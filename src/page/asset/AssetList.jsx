import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, ListView, WhiteSpace, WingBlank, Checkbox, SwipeAction, Switch, NavBar, Icon, InputItem, Toast, Button, } from 'antd-mobile';
import { Widget, addResponseMessage, toggleWidget, dropMessages, addLinkSnippet, addUserMessage, renderCustomComponent } from 'react-chat-widget';
import 'antd-mobile/dist/antd-mobile.css';
import HttpService from '../../util/HttpService.jsx';
import { result } from 'lodash';


class AssetList extends React.Component {

    constructor(props) {
        super(props);

        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        });
        this.state = {
            pageNum: 1,
            perPage: 10,
            dataList: [],
            listType: 'list',
            isLoading: false,
            hasMore: true,
            dataSource,
            searchValue: '',
            searchKeyword: ''
        };
    }



    componentDidMount() {
        this.getDataList();
    }

    //
    getDataList() {

        let param = {};

        // 如果是搜索的话，需要传入搜索类型和搜索关键字
        if (this.state.listType === 'search') {
            param.keyword = this.state.searchKeyword;
        }

        param.pageNum = this.state.pageNum;
        param.perPage = this.state.perPage;

        HttpService.post('reportServer/asset/listEamAsset', JSON.stringify(param)).then(response => {
            let dateList = [];
            if (1 < this.state.pageNum) {
                dateList = this.state.dataList.concat(response.data.list);
            } else {
                dateList = response.data.list;
            }
            let dataSource = this.state.dataSource.cloneWithRows(dateList);
            console.log('hasMore', dateList.length < response.data.total)
            this.setState({
                dataSource: dataSource,
                total: response.data.total,
                isLoading: false,
                dataList: dateList,
                hasMore: dateList.length < response.data.total
            });
        }, errMsg => {
            Toast.fail(errMsg);
        });
    }

    onEndReached = (event) => {
        // load new data
        // hasMore: from backend data, indicates whether it is the last page, here is false
        if (!this.state.hasMore) {
            return;
        }
        console.log('reach end', event);
        this.setState({ isLoading: true });
        this.state.pageNum++;
        this.getDataList();

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
            searchKeyword: searchKeyword,
            pageNum: 1,
            hasMore: true
        }, () => {
            this.getDataList();
        });
    }

    /**
     * 开始扫一扫
     */
    startScan() {

        cordova.plugins.barcodeScanner.scan(
            function (result) {
                console.log('扫描结果：', result)
                if (result.text != '') {
                    HttpService.post("reportServer/asset/getAssetByTag", JSON.stringify({ asset_tag: result.text }))
                        .then(res => {
                            console.log('查询结果', res)
                            if (res.resultCode == "1000") {
                                window.location.href = `#/asset/AssetDetail/update/${res.data.asset_id}`
                            } else {
                                console.log('提示失败：', res.message)
                                Toast.fail(res.message)
                                console.log('提示：', res.message)
                            }
                        });
                } else {
                    Toast.fail('未识别到内容，请重新扫描')
                }
            },
            function (error) {
                Toast.fail('扫描失败: ' + error);
            },
            {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: false, // iOS and Android
                showTorchButton: false, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                saveHistory: true, // Android, save scan history (default false)
                prompt: 'Place a barcode inside the scan area', // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                // formats: 'QR_CODE,PDF_417', // default: all but PDF_417 and RSS_EXPANDED
                orientation: 'portrait', // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true, // iOS
                disableSuccessBeep: false // iOS and Android
            }
        );
    }

    render() {

        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                    backgroundColor: '#F5F5F9',
                    height: 8,
                    borderTop: '1px solid #ECECED',
                    borderBottom: '1px solid #ECECED',
                }}
            />
        );
        let data = this.state.dataList;
        let index = data.length - 1;
        const row = (rowData, sectionID, rowID) => {
            if (index < 0) {
                index = data.length - 1;
            }
            const obj = data[index--];
            return (
                <div key={rowID} style={{ padding: '0 15px' }} onClick={
                    () => {
                        window.location.href = `#/asset/AssetDetail/update/${obj.asset_id}`
                    }
                }>
                    <div
                        style={{
                            lineHeight: '50px',
                            color: '#888',
                            fontSize: 14,
                            borderBottom: '1px solid #F6F6F6',
                        }}
                    >{obj.asset_name}</div>
                    <div style={{ display: '-webkit-box', display: 'flex', padding: '15px 0' }}>
                        <img style={{ height: '64px', width: '64px', marginRight: '15px' }} src={`${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=thumbnail_${obj.image}`} />
                        <div style={{ lineHeight: 1 }}>
                            <div style={{ marginBottom: '8px', lineHeight: '22px', color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px' }}>
                                资产标签：{obj.asset_tag}<br />
                            物联网标签：{obj.iot_num}<br />
                            资产原值：{obj.cost}<br />
                            资产净额：{obj.netQuota}<br />
                            责任人：{obj.dutyName}<br />
                            启用日期：{obj.startDate}<br />
                            </div>

                        </div>
                    </div>
                </div >
            );
        };

        return (
            <div>
                <NavBar
                    mode="light"
                    style={{ backgroundColor: 'rgb(79,188,242)', color: 'rgb(255,255,255)' }}
                    rightContent={[
                        <div onClick={() => {
                            this.startScan()
                        }}>扫一扫</div>
                    ]}

                >
                    <span style={{ color: 'white' }}>资产列表</span>
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

                <ListView
                    ref={el => this.lv = el}
                    dataSource={this.state.dataSource}
                    renderFooter={() => (<div style={{ padding: 30, textAlign: 'center' }}>
                        {this.state.isLoading ? '加载中...' : '加载完成'}
                    </div>)}
                    renderRow={row}
                    renderSeparator={separator}
                    className="am-list"
                    pageSize={4}
                    useBodyScroll
                    onScroll={() => { console.log('scroll'); }}
                    scrollRenderAheadDistance={500}
                    onEndReached={this.onEndReached}
                    onEndReachedThreshold={10}
                />
            </div >
        )
    }
}
export default AssetList;
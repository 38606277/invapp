import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, ListView, NavBar, Toast, Button, SegmentedControl } from 'antd-mobile';
import { Widget, addResponseMessage, toggleWidget, dropMessages, addLinkSnippet, addUserMessage, renderCustomComponent } from 'react-chat-widget';
import 'antd-mobile/dist/antd-mobile.css';
import HttpService from '../../util/HttpService.jsx';
import { result } from 'lodash';


class AssetAlarmList extends React.Component {

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
            searchKeyword: '',
            statusName: '未处理', // 0-未处理 ， 1-已处理
            segmentedIndex: 0
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

        if (this.state.statusName == '未处理') {
            param.status = '0';
        } else if (this.state.statusName == '已处理') {
            param.status = '1';
        } else {
            param.status = '0';
        }

        HttpService.post('reportServer/alarm/listEamAlarm', JSON.stringify(param)).then(response => {
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




    onSegmentedChange = (e) => {
        this.setState({
            segmentedIndex: e.nativeEvent.selectedSegmentIndex,
        });
    }

    onValueChange = (value) => {
        if (value == this.state.statusName) {
            return;
        }
        console.log('onValueChange', value)
        this.setState({
            listType: 'list',
            pageNum: 1,
            hasMore: true,
            statusName: value
        }, () => {
            this.getDataList();
        });

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
                        // window.location.href = `#/asset/AssetDetail/update/${obj.asset_id}`
                    }
                }>
                    <div
                        style={{
                            lineHeight: '50px',
                            color: '#888',
                            fontSize: 14,
                            borderBottom: '1px solid #F6F6F6',
                        }}
                    > {obj.alarm_num}</div>
                    <div style={{ display: '-webkit-box', display: 'flex', padding: '15px 0' }}>
                        <div style={{ lineHeight: 1 }}>
                            <div style={{ marginBottom: '8px', lineHeight: '22px', color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px' }}>
                                资产标签号：{obj.asset_tag}<br />
                            物联网标签号：{obj.iot_num}<br />
                            资产名称：{obj.asset_name}<br />
                            报警类型：{obj.alarm_type}<br />
                            报警时间：{obj.alarm_time}<br />
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
                >
                    <span style={{ color: 'white' }}>资产报警</span>
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

                <SegmentedControl
                    style={{ marginLeft: '10px', marginRight: '10px' }}
                    values={['未处理', '已处理']}
                    value={this.state.statusName}
                    onValueChange={this.onValueChange}
                    onChange={this.onSegmentedChange}
                    selectedIndex={this.state.segmentedIndex}
                />

                <ListView
                    style={{ marginTop: '10px' }}
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
export default AssetAlarmList;
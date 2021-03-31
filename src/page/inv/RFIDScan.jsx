import React from 'react';
import { Button, } from 'antd-mobile';
import 'antd-mobile/dist/antd-mobile.css';


export default class RFIDScan extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            content: '',
            valueList: []
        }
    }

    componentDidMount() {
        this.initRfid();
    }

    initRfid = () => {
        console.log('initRfid')
        cordova.plugins.RFIDPlugin.init("init", (success) => {
            console.log('initRfid success', success)
            if (success.status == 'scanStarted') { //扫描开始
                this.setState({ content: success.data })
            } else if (success.status == 'scanResult') { //扫描结果回调
                console.log('sacnRfidCallBack scanResult')
                success.data.forEach(element => {
                    const isHas = this.state.valueList.find((oldElement) => {
                        return element.epcId == oldElement.epcId;
                    })
                    if (!isHas) {
                        this.state.valueList.push(element);
                    }
                });

                this.setState(
                    {
                        content: `扫描中，数量${this.state.valueList.length}`,
                        valueList: this.state.valueList,
                    }
                )
            } else if (success.status == 'scanStopped') { // 扫描结束
                this.setState({ content: `扫描停止，数量${this.state.valueList.length}`, })
            }
        }, (error) => {
            console.log('initRfid error', error)
            this.setState(
                {
                    content: error.data
                }
            )
        })
    }

    startClick() {
        console.log('startClick', cordova.plugins.RFIDPlugin)
        cordova.plugins.RFIDPlugin.start('start', (success) => { console.log('startClick success', success) }, (error) => { console.log('startClick error', error) });
    }

    stopClick() {
        console.log('stopClick', cordova.plugins.RFIDPlugin)
        cordova.plugins.RFIDPlugin.stop('stop', (success) => { console.log('stopClick success', success) }, (error) => { console.log('stopClick error', error) });
    }

    //界面渲染
    render() {
        const displayValue = [];
        console.log('this.state.valueList size ', this.state.valueList.length)
        this.state.valueList.forEach(element => {
            displayValue.push(<div> {element.epcId}</div>)
        });
        return (
            <div >
                <Button style={{ width: '20%', marginLeft: '20px', marginTop: '20px' }} onClick={() => { this.startClick() }} > 开始扫描</Button>
                <Button style={{ width: '20%', marginLeft: '20px', marginTop: '20px' }} onClick={() => { this.stopClick() }} > 结束扫描</Button>
                {this.state.content}
                <br />
                { displayValue}
            </div >
        )
    }
}

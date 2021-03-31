import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, List, WhiteSpace, WingBlank, Checkbox, SwipeAction, Switch, NavBar, Icon, InputItem, Toast, Button, } from 'antd-mobile';
import { Widget, addResponseMessage, toggleWidget, dropMessages, addLinkSnippet, addUserMessage, renderCustomComponent } from 'react-chat-widget';
import 'antd-mobile/dist/antd-mobile.css';
import HttpService from '../../util/HttpService.jsx';
import { result } from 'lodash';
import HexUtils from '../../common/HexUtils.jsx'
import { Base64 } from 'js-base64';
import { parseFromBytes, uint8ArrayToString } from '../../common/ScanRecordUtil.js'

import ScanWidget from '../../util/scan/ScanWidget.jsx'

class AssetScan extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isInitialized: false,//是否初始化
            isEnabled: false,//是否启用
            errorMessage: '',//错误提示
            hasPermission: false,//是否开启权限
            isLocationEnabled: false,//定位服务是否开启
            foundDevices: [], //找到的设备集合
            isScaning: false
        }
    }
    componentDidMount() {

    }

    /**
     * 界面销毁
     */
    componentWillUnmount() {
        this.stopScanBluetooth();
    }

    getAdapterInfo() {
        bluetoothle.getAdapterInfo((result) => {
            console.log('getAdapterInfo - ', result);
        })
    }


    /**
     * 跳过方法
     */
    nextMethod() {
        console.log('nextMethod');
        return new Promise(function (resolve, reject) {
            resolve();
        })
    }

    /**
     * 结束方法
     * @param {*} message 
     */
    rejectMethod(message) {
        console.log('rejectMethod : ', message);
        return new Promise(() => { });
    }

    /**
     * 检查是否初始化蓝牙
     */
    checkInitialized() {
        return new Promise(function (resolve, reject) {
            bluetoothle.isInitialized((result) => {
                console.log('checkInitialized result - ', result);
                if (result.isInitialized) {//是否初始化
                    resolve();
                } else {
                    reject();
                }
            });
        })
    }

    /**
     * 初始化蓝牙
     */
    initBluetooth() {
        return new Promise(function (resolve, reject) {
            console.log('call initBluetooth');
            bluetoothle.initialize((result) => {
                console.log('initBluetooth result - ', result);
                if (result.status == 'enabled') {//判断是否初始化成功
                    resolve();
                } else {
                    reject('初始化失败');
                }
            }, {
                "request": true,
                "statusReceiver": false,
                "restoreKey": "bluetoothleplugin"
            });
        })
    }

    /**
     * 是否启用蓝牙
     */
    isEnabledBuletooth() {
        return new Promise(function (resolve, reject) {
            bluetoothle.isEnabled((result) => {
                console.log('isEnabledBuletooth result - ', result);
                if (result.isEnabled) {
                    resolve();
                } else {
                    reject();
                }
            });
        })

    }

    /**
     * 启用蓝牙
     */
    enabledBuletooth() {
        console.log('enabledBuletooth');
        return new Promise(function (resolve, reject) {
            bluetoothle.enable((result) => {
                console.log('enabledBuletooth result- ', result);
                if (result.status == 'enable') {
                    resolve()
                } else {
                    reject('启用蓝牙失败');
                }
            }, (error) => {
                console.log('enabledBuletooth error- ', error);
                reject('启用蓝牙失败');
            });
        })
    }


    /**
     * 检查权限
     */
    checkPermission() {
        return new Promise(function (resolve, reject) {
            bluetoothle.hasPermission((result) => {
                console.log('checkPermission result - ', result);
                if (result.hasPermission) {
                    resolve();
                } else {
                    reject();
                }

            });
        })
    }

    /**
     * 申请权限
     */
    requestPermission() {
        return new Promise((resolve, reject) => {
            bluetoothle.requestPermission((result) => {
                console.log('requestPermission result - ', result);
                if (result.requestPermission) {
                    resolve()
                } else {
                    reject('申请权限失败');
                }
            }, (error) => {
                console.log('requestPermission error - ', error);
                reject('申请权限失败');
            });
        })
    }

    /**
     * 检查定位权限是否开启
     */
    checkLocationEnabled() {
        return new Promise((resolve, reject) => {
            bluetoothle.isLocationEnabled((result) => {
                console.log('checkLocationEnabled result - ', result);
                if (result.isLocationEnabled) {
                    resolve();
                } else {
                    reject('检查定位权限失败');
                }
            }, (error) => {
                console.log('checkLocationEnabled error - ', error);
                reject('检查定位权限失败');
            });
        })
    }

    /**
     * 请求位置权限
     */
    requestLocation() {
        return new Promise((resolve, reject) => {
            bluetoothle.requestLocation((result) => {
                console.log('requestLocation result - ', result);
                if (result.requestLocation) {
                    resolve();
                } else {
                    reject('申请位置权限失败');
                }
            }, (error) => {
                console.log('requestLocation error - ', error);
                reject('申请位置权限失败');
            });
        })
    }


    /**
      * 是否正在扫描
      */
    checkIsScanning() {
        console.log('checkIsScanning')
        return new Promise((resolve, reject) => {
            bluetoothle.isScanning((result) => {
                console.log('checkIsScanning result - ', result);
                if (result.isScanning) {
                    resolve('已开启扫描，请勿重复开启');
                } else {
                    reject('已关闭扫描，请勿重复关闭')
                }
            });
        })
    }

    /**
     * 停止扫描
     */
    stopScan() {
        return new Promise((resolve, reject) => {
            bluetoothle.stopScan((result) => {
                console.log('stopScan result - ', result);
                if (result.status == 'scanStopped') {
                    resolve()
                } else {
                    reject('停止扫描失败');
                }

            }, (error) => {
                console.log('stopScan error - ', error);
                reject('停止扫描失败');
            });
        })
    }


    /**
      * 开始扫描
      */
    startScan() {
        console.log('开始扫描')
        this.setState({
            isScaning: true
        })
        console.log('开始扫描---')
        bluetoothle.startScan((result) => {

            //this.analysisIOSData(result);

            this.analysisAndroidData(result);

        }, (error) => {
            console.log('startScan error - ', error);
        }, {
            "services": [],
            "allowDuplicates": false, // True/false允许重复的广告数据包，默认为false。
            "scanMode": bluetoothle.SCAN_MODE_LOW_LATENCY,//扫描模式-默认为低功耗
            "matchMode": bluetoothle.MATCH_MODE_AGGRESSIVE,//默认为一个广告。API23提供。
            "matchNum": bluetoothle.MATCH_NUM_MAX_ADVERTISEMENT,//默认为Aggressive。API23提供。
            "callbackType": bluetoothle.CALLBACK_TYPE_ALL_MATCHES,//默认为所有匹配项。可从API21/API 23获得。*注意：小心使用这个。在API 21上的Nexus7上使用CALLBACK_TYPE_FIRST_MATCH时，启动扫描时收到一个功能不受支持的错误。
        });
    }

    /**
     * 解析ios蓝牙数据
     * @param {*} iosResult 
     */
    analysisIOSData(iosResult) {
        if (iosResult.status === "scanResult") {
            // if (iosResult.name == 'tBeacon') {
            //console.log('iosResult - ', iosResult);
            // }
        }
    }



    /**
     * 解析android蓝牙数据
     * @param {} androidResult 
     */
    analysisAndroidData(androidResult) {
        let foundDevices = this.state.foundDevices;

        if (androidResult.status === "scanResult") {
            if (!foundDevices.some(function (device) {
                return device.address === androidResult.address;
            })) {

                let label = this.analysisAdvertisement(androidResult.advertisement);
                if (label != null) {
                    androidResult.label = label;
                    foundDevices.push(androidResult);
                    this.setState({
                        foundDevices
                    })
                }
                // console.log('androidResult.address - ', androidResult.address);
                //console.log('startScan result - ', result);
            }
        }
    }





    //检查权限
    startScanBluetoothAndroid() {
        console.log('startScanBluetoothAndroid - start');
        //nextMethod 跳过当前的then
        this.checkInitialized()//是否初始化
            .then(this.nextMethod, this.initBluetooth)//初始化
            .then(this.checkPermission, this.rejectMethod)//检查权限
            .then(this.nextMethod, this.requestPermission)//申请权限
            .then(this.checkLocationEnabled, this.rejectMethod)//检查位置权限
            .then(this.nextMethod, this.requestLocation)//申请检查位置权限
            .then(this.isEnabledBuletooth, this.rejectMethod)//是否启用蓝牙
            .then(this.nextMethod, this.enabledBuletooth)//申请打开蓝牙
            .then(this.checkIsScanning, this.rejectMethod)//检查是否正在扫描
            .then(this.rejectMethod, () => {
                this.startScan();
            })//开始扫描
    }


    //检查权限
    startScanBluetoothIOS() {
        console.log('startScanBluetoothIOS - start');
        //nextMethod 跳过当前的then
        this.checkInitialized()//是否初始化
            .then(this.nextMethod, this.initBluetooth)//初始化
            // .then(this.checkPermission, this.rejectMethod)//检查权限
            // .then(this.nextMethod, this.requestPermission)//申请权限
            // .then(this.checkLocationEnabled, this.rejectMethod)//检查位置权限
            // .then(this.nextMethod, this.requestLocation)//申请检查位置权限
            // .then(this.isEnabledBuletooth, this.rejectMethod)//是否启用蓝牙
            // .then(this.nextMethod, this.enabledBuletooth)//申请打开蓝牙
            .then(this.checkIsScanning, this.rejectMethod)//检查是否正在扫描
            .then(this.rejectMethod, () => {
                this.startScan();
            })//开始扫描
    }



    //停止扫描
    stopScanBluetooth() {
        this.checkIsScanning()
            .then(this.stopScan, this.rejectMethod)
            .then(() => {

                this.setState({
                    isScaning: false
                })
                console.log('停止扫描成功 isScaning ', this.state.isScaning)
            }, this.rejectMethod)
    }

    test() {
        let advertisement = 'AgEGE/9MAAwOCBkPpPG7ZC2Ww3N0N3gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
        // var advertisement = 'Hv8GAAEPIALEbkN0ElYsVjzy3SC0oFaQVz+D96CkxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
        let advertisementListStr = "AgEGAwL//hIJREVMSV9ETC1EMV81MDIyNDIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEPIALLfJDGvl+jqVWZ1kIAGEGg9hVbBqZyBgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIALXxsZ4KspKmQQutdJYw5Z4I3Pjidj4SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAIZfqts6QzXFATQUanIL5m/tQ4EdCJ/DQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAIifliekwtvcJ2ZURI2/inqnzlnRu8ligAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAKSQN08i+HdOgeWEaJy2UjA7ukj5OgLWwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAIHdfV/6GQqldrmJRFNwH0o9ynoLyNmsQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEPIAJ357l1WnQ0xA/EpVtI8XqgUyN98OUGtgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAL+SmILiKNtv74oQN/Gz8nxKhpYqKlZPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEPIAJ8gtlI3r+Bprwnw/fktXBioqodJGU9PQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAKeh5RdRFASUbKMd0FcRH+4SeafokCP0gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAIwY2N9stxt8IZEfYmI/2e/w9EzXMhaFgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAKBVz2MOd06nT7aMCX2iRa4tfNkO6WokgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAJSs84wQv+PJWJwsHulhAc0teNPtlrjxgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAKHSEpgAJ/0nDPvNGqk6wg0FzFcnbqqLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,AgEaAgoMC/9MABAGEx4lsgCNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEPIAJlB7SeJwDf8AWZNH3ayHu/nD/gfqdtPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAI0WFa1OOk0y+tUjJ9Pop7KrZVGbar4TgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,AgEGCwlCQ1MzMTFERjZFAwIE/gsJQkNTMzExREY2RQv//Fj+BPxYoRHfbgAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIALy7gFvuUHM6ZNyUm50pGDUJVeGlt56UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAJEvTqXVz3uPfbcQrYPUO9Hh3H9Nj9akQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,AgEGCv9MABAFQxyMjeQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEPIAKvk4mSol7lc8Jm7/m9Dydoni+6H4hkPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,AgEaAgoHCv9MABAFfhz/Mh4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,AgEaAgoMCv9MABAFExglWXcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,AgEGCv9MABAFQxyMjeQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAICm6w8qSN3injV7oUIimeRgMtFXcZxRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,AgEaAgoMCv9MABAFARiTtREAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,AgEaAgoMCv9MABAFGRgbLwYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIALItMOLhy97+pNDDpo27DI6ceK33k/r1QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAI/cU3SoXY3+iZhNXUvWJcS0A9kfUgBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,AgEGGv9MAAIV/aUGk6TiT7Gvz8brB2R4JcX2CCDACAl0QmVhY29uAgoCAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIALlG354zuVuDmdlpwvl0VFfH9BNL+Q15wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAJzvlSzkjKxJ9FuGD4PPWny0wzn05uOKQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=,Hv8GAAEJIAJhxr4j55gFku+85nGjATp62R4vong8BgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
        let advertisementList = advertisementListStr.split(",");

        for (let i = 0; i < advertisementList.length; i++) {
            this.decodeAdvertisement(advertisementList[i]);
        }
    }

    analysisAdvertisement(advertisement) {
        if (advertisement == '' || typeof advertisement == 'undefined') {
            return null;
        }

        // base64转字节数组
        let data = atob(advertisement);
        let bytes = new Uint8Array(data.length);

        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = data.charCodeAt(i);
        }

        // 字节数组转16进制字符串
        let hexStr = HexUtils.bytesToHexStr(bytes);
        // console.log('value ： ', hexStr);

        //  4C000215FDA50693A4E24FB1AFCFC6EB07647825(唯一标识)
        let identification = '4C000215FDA50693A4E24FB1AFCFC6EB07647825';

        let identificationIndex = hexStr.indexOf(identification);
        // console.log('identificationIndex ： ', identificationIndex);
        if (identificationIndex < 0) {
            return null;
        }
        let startIndex = identificationIndex + identification.length;
        // console.log('startIndex ： ', startIndex);
        let labelHex = hexStr.slice(startIndex, startIndex + 8);
        // console.log('hexStr ： ', hexStr);
        return this.analysisLabel(labelHex);
    }

    analysisLabel(labelStr) {
        //解析label数据
        let electricityHex = labelStr.slice(0, 1);
        let electricityValue = ((parseInt(electricityHex, 16) + 20) / 10);
        // console.log('electricityValue ： ', electricityValue);

        let numberHex = labelStr.slice(1);
        let numberValue = parseInt(numberHex, 16);

        // console.log('numberValue ： ', numberValue);
        return {
            electricity: electricityValue,
            number: numberValue
        }
    }



    decodeAdvertisement(advertisement) {
        console.log('advertisement', advertisement)
        let data = atob(advertisement);
        let bytes = new Uint8Array(data.length);

        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = data.charCodeAt(i);
        }

        let value = HexUtils.bytesToHexStr(bytes);
        console.log('value ： ', value);

        let obj = parseFromBytes(bytes);
        console.log('obj ： ', obj);

        let mManufacturerSpecificData = obj.mManufacturerSpecificData.get(76);
        console.log('mManufacturerSpecificData ： ', mManufacturerSpecificData);

        let mManufacturerSpecificDataValue = HexUtils.bytesToHexStr(mManufacturerSpecificData);
        console.log('mManufacturerSpecificDataValue ： ', mManufacturerSpecificDataValue);

        if (mManufacturerSpecificDataValue != '') {
            //截取标签数据
            let labelValue = mManufacturerSpecificDataValue.slice(36, 44);
            console.log('labelValue ： ', labelValue);
            return this.analysisLabel(labelValue);
        }

        return null;
    }



    /**
     * 获取厂商自定义数据
     * @param {} bytes  //广播数据base数据
     */
    getManufacturerSpecificData(advertisement) {
        //base64转字节数组 
        let bytes = HexUtils.base64ToBytes(advertisement);
        //解析广播数据
        let obj = parseFromBytes(bytes);
        console.log('obj ： ', obj);
        // 获取厂商自定义数据
        let mManufacturerSpecificData = obj.mManufacturerSpecificData.get(76);
        console.log('mManufacturerSpecificData ： ', mManufacturerSpecificData);
        //厂商自定义数据转16进制
        let mManufacturerSpecificDataValue = HexUtils.bytesToHexStr(mManufacturerSpecificData);
        console.log('mManufacturerSpecificDataValue ： ', mManufacturerSpecificDataValue);
        return mManufacturerSpecificDataValue;
    }

    render() {
        let { foundDevices } = this.state;
        let devicesListUI = [];

        for (let i in foundDevices) {
            let devices = foundDevices[i];
            // console.log('devices ： ', devices);
            let labelModel = devices.label;
            // console.log('labelModel', labelModel);
            devicesListUI.push(<div style={{ marginLeft: '8px' }}>
                <br />
                {`${devices.name} - ${devices.address}`}
                <br />
                {labelModel == null ? '' : `标签号 :  ${labelModel.number}`}
                <br />
                {labelModel == null ? '' : `电压 :  ${labelModel.electricity}V`}
                <br />
                {labelModel == null ? '' : `信号强度 :  ${devices.rssi}`}
                <br />
            </div>)
        }


        return (
            <div>

                <NavBar
                    mode="light"
                    icon={<Icon type="left" />}
                    style={{ backgroundColor: 'rgb(79,188,242)', color: 'rgb(255,255,255)' }}
                    onLeftClick={() => window.location.href = "#/My"}
                >
                    <span style={{ color: 'white' }}>扫描资产</span>
                </NavBar>
                <ScanWidget />
                <Button onClick={() => {
                    this.startScanBluetoothAndroid();
                }}> 开始扫描 </Button>

                <Button onClick={() => {
                    this.stopScanBluetooth();
                }}> 停止扫描 </Button>
                {/* <Button onClick={() => {
                    this.test1();
                }}> 测试 </Button> */}

                <div >
                    设备列表( <span style={{ color: "green" }}>{this.state.isScaning ? '正在扫描' : '停止扫描'}</span>):<br />
                    {devicesListUI}
                </div>


            </div >
        )
    }
}
export default AssetScan;
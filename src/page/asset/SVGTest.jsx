import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, List, WhiteSpace, WingBlank, Checkbox, SwipeAction, Switch, NavBar, Icon, InputItem, Toast, Button, } from 'antd-mobile';
import { Widget, addResponseMessage, toggleWidget, dropMessages, addLinkSnippet, addUserMessage, renderCustomComponent } from 'react-chat-widget';
import 'antd-mobile/dist/antd-mobile.css';
import HttpService from '../../util/HttpService.jsx';
import { result } from 'lodash';


class SVGTest extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isInitialized: false,//是否初始化
            isEnabled: false,//是否启用
            errorMessage: '',//错误提示
            hasPermission: false,//是否开启权限
            isLocationEnabled: false,//定位服务是否开启
            foundDevices: [] //找到的设备集合
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
     * 检查是否初始化蓝牙
     */
    checkInitialized() {
        return new Promise(function (resolve, reject) {
            bluetoothle.isInitialized((result) => {
                console.log('checkInitialized result - ', result);
                resolve(result.isInitialized);
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
                resolve(result.status == 'enabled');//判断是否初始化成功
            }, {
                "request": true,
                "statusReceiver": true,
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
                resolve(result.isEnabled);
            });
        })

    }

    /**
     * 启用蓝牙
     */
    enabledBuletooth() {
        return new Promise(function (resolve, reject) {
            bluetoothle.enable((result) => {
                console.log('enabledBuletooth result- ', result);
                resolve(true)
            }, (error) => {
                console.log('enabledBuletooth error- ', error);
                reject(false);
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
                resolve(result.hasPermission);
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
                resolve(result.requestPermission)
            }, (error) => {
                console.log('requestPermission error - ', error);
                reject(false);
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
                resolve(result.isLocationEnabled);
            }, (error) => {
                console.log('checkLocationEnabled error - ', error);
                reject(false);
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
                resolve(result.requestLocation)
            }, (error) => {
                console.log('requestLocation error - ', error);
                reject(false);
            });
        })
    }


    /**
      * 是否正在扫描
      */
    checkIsScanning() {
        return new Promise((resolve, reject) => {
            bluetoothle.isScanning((result) => {
                console.log('checkIsScanning result - ', result);
                resolve(result.isScanning);
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
                resolve(result.status == 'scanStopped')
            }, (error) => {
                console.log('stopScan error - ', error);
                reject(false);
            });
        })
    }


    /**
     * 开始扫描
     */
    startScan() {
        console.log('开始扫描')
        bluetoothle.startScan((result) => {

            let foundDevices = this.state.foundDevices;

            if (result.status === "scanResult") {
                if (!foundDevices.some(function (device) {
                    return device.address === result.address;
                })) {
                    foundDevices.push(result);
                    this.setState({
                        foundDevices
                    })
                    console.log('startScan result - ', result);
                }
            }
        }, (error) => {
            console.log('startScan error - ', error);
        }, {
            "services": [],
            "allowDuplicates": true,
            "scanMode": bluetoothle.SCAN_MODE_LOW_LATENCY,
            "matchMode": bluetoothle.MATCH_MODE_AGGRESSIVE,
            "matchNum": bluetoothle.MATCH_NUM_MAX_ADVERTISEMENT,
            "callbackType": bluetoothle.CALLBACK_TYPE_ALL_MATCHES,
        });
    }

    //检查权限
    async startScanBluetooth() {

        console.log('scanBluetooth - start');

        //初始化
        let isInit = await this.checkInitialized();
        console.log(`isInit : ${isInit}`);
        if (!isInit) {
            console.log(`isInit 2 start`);
            isInit = await this.initBluetooth();
            console.log(`isInit 2: ${isInit}`);
            if (!isInit) {
                console.log('初始化失败')
                return;
            }
        }

        //蓝牙是否启用
        let isEnabled = await this.isEnabledBuletooth();
        console.log(`isEnabled : ${isEnabled}`);
        if (!isEnabled) {
            isEnabled = await this.enabledBuletooth();
            console.log(`isEnabled2 : ${isEnabled}`);
            if (!isEnabled) {
                console.log('启用失败')
                return;
            }
        }

        //检查权限
        let isRequestPermission = await this.checkPermission();
        console.log(`isRequestPermission : ${isRequestPermission}`);
        if (!isRequestPermission) {
            isRequestPermission = await this.requestPermission();
            console.log(`isRequestPermission2 : ${isRequestPermission}`);
            if (!isRequestPermission) {
                console.log('申请权限失败')
                return;
            }
        }

        //检查位置权限
        let isLocationEnabled = await this.checkLocationEnabled();
        console.log(`isLocationEnabled : ${isLocationEnabled}`);
        if (!isLocationEnabled) {
            isLocationEnabled = await this.requestLocation();
            if (!isLocationEnabled) {
                console.log('申请位置权限失败')
                return;
            }
        }

        //检查是否正在扫描
        let isScaning = await this.checkIsScanning();
        if (isScaning) {
            console.log('已开启扫描，请勿重复开启')
            return;
        }
        //开始扫描
        this.startScan();
    }

    //停止扫描
    async stopScanBluetooth() {

        //检查是否正在扫描
        let isScaning = await this.checkIsScanning();
        if (isScaning) {

            let isStopScan = await this.stopScan();
            if (isStopScan) {
                console.log('停止扫描成功')
            } else {
                console.log('停止扫描失败')
            }
        } else {
            console.log('已停止扫描，请勿重复停止')
        }
    }

    async test() {
        // console.log('test - start');
        // //初始化
        // let isInit = await this.checkInitialized();
        // console.log(`isInit : ${isInit}`);
        // if (!isInit) {
        //     console.log(`initBluetooth`);
        //     isInit = await this.initBluetooth();
        //     console.log(`initBluetooth - isInit : ${isInit}`);
        //     if (!isInit) {
        //         console.log('初始化失败')
        //         return;
        //     }
        // }
        // console.log('test - end');


        let isInit = await this.initBluetooth();
        console.log(`initBluetooth - isInit : ${isInit}`);
        if (!isInit) {
            console.log('初始化失败')
            return;
        }

    }


    render() {
        let { foundDevices } = this.state;
        let devicesListUI = [];
        for (let i in foundDevices) {
            let devices = foundDevices[i];
            devicesListUI.push(<div> {`${devices.name} - ${devices.address}`}</div>)
        }
        return (
            <div>
                <svg width="375px" height="667px" viewBox="0 0 375 667" version="1.1" xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink">

                    <title>登录页</title>
                    <desc>Created with Sketch.</desc>
                    <defs>
                        <pattern id="pattern-1" patternUnits="objectBoundingBox" y="-26.7257991%" height="126.725799%" width="100%">
                            <use xlinkHref="#image-2" transform="scale(0.467581047,0.467581047)"></use>
                        </pattern>

                        <image id="image-2"
                            width="802"
                            height="722" />

                        <rect id="path-3" x="0" y="0" width="249" height="40" rx="20"></rect>
                        <filter x="-1.4%" y="-8.8%" width="104.4%" height="127.5%" filterUnits="objectBoundingBox" id="filter-4">
                            <feMorphology radius="0.5" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                            <feOffset dx="2" dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                            <feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.229336504 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
                        </filter>
                        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-5">
                            <stop stop-color="#F3F6F5" offset="0%"></stop>
                            <stop stop-color="#E4EAE8" offset="100%"></stop>
                        </linearGradient>
                        <circle id="path-6" cx="16.5" cy="16.5" r="16.5"></circle>
                        <filter x="-28.8%" y="-31.8%" width="169.7%" height="169.7%" filterUnits="objectBoundingBox" id="filter-7">
                            <feMorphology radius="0.5" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                            <feOffset dx="2" dy="1" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                            <feGaussianBlur stdDeviation="3" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                            <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
                            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.146795743 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
                        </filter>
                        <circle id="path-8" cx="16.5" cy="16.5" r="16.5"></circle>
                        <filter x="-28.8%" y="-31.8%" width="169.7%" height="169.7%" filterUnits="objectBoundingBox" id="filter-9">
                            <feMorphology radius="0.5" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                            <feOffset dx="2" dy="1" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                            <feGaussianBlur stdDeviation="3" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.146795743 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
                        </filter>
                        <circle id="path-10" cx="16.5" cy="16.5" r="16.5"></circle>
                        <filter x="-28.8%" y="-31.8%" width="169.7%" height="169.7%" filterUnits="objectBoundingBox" id="filter-11">
                            <feMorphology radius="0.5" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                            <feOffset dx="2" dy="1" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                            <feGaussianBlur stdDeviation="3" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.146795743 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
                        </filter>
                        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-12">
                            <stop stop-color="#E4EAE8" offset="0%"></stop>
                            <stop stop-color="#E4EAE8" offset="100%"></stop>
                        </linearGradient>
                    </defs>
                    <g id="登录页" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <rect fill="#FFFFFF" x="0" y="0" width="375" height="667"></rect>
                        <g id="锁2" transform="translate(275.000000, 403.000000)" fill="#888888" fill-rule="nonzero">
                            <path d="M15.5454545,7.44925926 L15.5454545,5.37037037 C15.5454545,2.40925926 12.609,0 9,0 C5.391,0 2.45454546,2.40925926 2.45454546,5.37037037 C2.45454546,5.57492028 2.6377017,5.74074074 2.86363637,5.74074074 C3.08957104,5.74074074 3.27272728,5.57492028 3.27272728,5.37037037 C3.27272728,2.8174074 5.84181818,0.740740742 9,0.740740742 C12.1581818,0.740740742 14.7272727,2.8174074 14.7272727,5.37037037 L14.7272727,7.4074074 L2.95731818,7.4074074 C1.32668182,7.4074074 0,8.60851852 0,10.0848148 L0,17.3225926 C0,18.7988889 1.32668182,20 2.95731818,20 L15.0426818,20 C16.6733182,20 18,18.7988889 18,17.3225926 L18,10.0848148 C18,8.76407408 16.9367727,7.66629631 15.5454545,7.44925926 Z M17.1818182,17.3225926 C17.1804655,18.3916764 16.2235335,19.2580346 15.0426818,19.2592593 L2.95731818,19.2592593 C1.77646653,19.2580346 0.819534461,18.3916764 0.81818182,17.3225926 L0.81818182,10.0848148 C0.819534449,9.01573102 1.77646652,8.14937276 2.95731818,8.14814814 L15.0426818,8.14814814 C16.2235335,8.14937276 17.1804656,9.01573102 17.1818182,10.0848148 L17.1818182,17.3225926 Z" id="形状"></path>
                            <path d="M9.5625,11 C8.63184376,11 7.875,11.6407143 7.875,12.4285714 L7.875,14.5714286 C7.875,15.3592857 8.63184376,16 9.5625,16 C10.4931562,16 11.25,15.3592857 11.25,14.5714286 L11.25,12.4285714 C11.25,11.6407143 10.4931562,11 9.5625,11 Z M10.40625,14.5714286 C10.40625,14.9653572 10.0278281,15.2857143 9.5625,15.2857143 C9.09717188,15.2857143 8.71875,14.9653572 8.71875,14.5714286 L8.71875,12.4285714 C8.71875,12.0346429 9.09717188,11.7142857 9.5625,11.7142857 C10.0278281,11.7142857 10.40625,12.0346429 10.40625,12.4285714 L10.40625,14.5714286 Z" id="形状"></path>
                        </g>
                        <g id="邮件-(3)" transform="translate(275.000000, 350.000000)" fill="#888888" fill-rule="nonzero">
                            <path d="M16.1220376,0 L1.92653281,0 C0.86186994,0 0,0.832653053 0,1.81224489 L0,10.1877551 C0,11.1673469 0.86186994,12 1.87583455,12 L16.1220375,12 C17.1360022,12 17.9978721,11.1673469 17.9978721,10.1877551 L17.9978721,1.81224489 C18.0485703,0.832653053 17.1867004,0 16.1220376,0 Z M17.2880969,1.81224489 L17.2880969,10.1877551 C17.2880969,10.3346939 17.2373987,10.4816327 17.1867004,10.6285714 L12.268972,5.87755102 L17.0853039,1.2244898 C17.1867004,1.42040817 17.2880969,1.61632652 17.2880969,1.81224489 Z M16.1220376,0.734693867 C16.2741322,0.734693867 16.3755287,0.783673451 16.5276234,0.783673451 L16.4769252,0.783673451 L9.83545688,7.2489796 C9.42987102,7.64081635 8.66939757,7.64081635 8.21311349,7.2489796 L1.57164517,0.832653053 L1.52094695,0.832653053 C1.62234341,0.783673468 1.7744381,0.783673468 1.92653281,0.783673468 L16.1220376,0.734693867 L16.1220376,0.734693867 Z M0.86186994,10.6285714 C0.811171716,10.4816327 0.760473475,10.3836735 0.760473475,10.2367347 L0.760473475,1.81224489 C0.760473475,1.61632652 0.811171698,1.37142857 0.963266404,1.2244898 L5.77959837,5.87755102 L0.86186994,10.6285714 Z M1.92653279,11.3142857 C1.72373986,11.3142857 1.57164517,11.2653061 1.36885224,11.1673469 L6.28658068,6.41632653 L7.70613114,7.7877551 C8.06101876,8.13061224 8.51730284,8.32653061 9.02428517,8.32653061 C9.53126749,8.32653061 9.98755155,8.13061224 10.3424392,7.7877551 L11.7112914,6.46530612 L16.6290199,11.2163265 C16.4769252,11.3142857 16.2741322,11.3632653 16.0713393,11.3632653 L1.92653279,11.3632653 L1.92653279,11.3142857 Z" id="形状"></path>
                        </g>
                        <rect id="矩形" fill="url(#pattern-1)" x="0" y="0" width="375" height="220"></rect>
                        <g id="注册登录按钮" transform="translate(63.000000, 200.000000)">
                            <g id="注册">
                                <g id="矩形">
                                    <use fill="black" fill-opacity="1" filter="url(#filter-4)" xlinkHref="#path-3"></use>
                                    <use fill="#FFFFFF" fill-rule="evenodd" xlinkHref="#path-3"></use>
                                </g>
                                <text id="注-册" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" fill="#97A3A3">
                                    <tspan x="176" y="26">注 册</tspan>
                                </text>
                            </g>
                            <g id="登录">
                                <rect id="矩形" fill="url(#linearGradient-5)" x="0" y="0" width="140" height="40" rx="20"></rect>
                                <text id="登-录" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" fill="#7092A7">
                                    <tspan x="51" y="26">登 录</tspan>
                                </text>
                            </g>
                        </g>
                        <line x1="68.5" y1="290.5" x2="104.5" y2="290.5" id="直线" stroke="#F4F4F4" stroke-linecap="square"></line>
                        <line x1="273.5" y1="290.5" x2="309.5" y2="290.5" id="直线" stroke="#F4F4F4" stroke-linecap="square"></line>
                        <g id="第三方登录" transform="translate(115.000000, 274.000000)">
                            <g id="QQ登录">
                                <g id="椭圆形">
                                    <use fill="black" fill-opacity="1" filter="url(#filter-7)" xlinkHref="#path-6"></use>
                                    <use fill-opacity="0.448963995" fill="#FFFFFF" fill-rule="evenodd" xlinkHref="#path-6"></use>
                                </g>
                                <path d="M10.5834245,16.0957891 C10.5119178,15.924783 10.5014214,15.7544198 10.5014214,15.5737705 C10.5014214,15.292189 10.6857643,14.8402443 10.8602668,14.6293796 C10.8497704,14.3683703 10.9626066,13.8360656 11.1679423,13.6650595 C11.1679423,11.8064931 12.633501,9.46640952 14.3457249,8.66280939 C15.4012683,8.17036323 16.5086377,8 17.6671769,8 C18.5692106,8 19.5532473,8.21086468 20.3936147,8.55223402 C22.8025366,9.54676954 23.3457249,11.3950498 23.85808,13.7557056 L23.8685764,13.8058502 C24.1657555,14.2481517 24.4321015,14.7701704 24.4321015,15.3127612 C24.4321015,15.5840566 24.2477586,15.855352 24.2477586,16.096432 C24.2477586,16.1163613 24.3094249,16.1967213 24.3192653,16.2166506 C25.2009622,17.4921247 26,18.8788171 26,20.4654452 C26,20.8171006 25.8051607,22.0424301 25.2311393,22.0424301 C24.8316204,22.0424301 24.3907719,21.088396 24.2471025,20.8267438 C24.2366062,20.8164577 24.2267658,20.8164577 24.2162694,20.8164577 L24.1650995,20.8569592 C23.8370873,21.6907747 23.4782418,22.4744455 22.811721,23.0967535 C23.3962388,23.6489875 24.338946,23.5988428 24.5134485,24.5535198 C24.4622786,24.6640952 24.4826153,24.7843137 24.4006123,24.8948891 C23.8160945,25.75892 22.2481959,25.8694953 21.3048327,25.8694953 C20.05445,25.8694953 19.0395801,25.5480553 17.8607041,25.206686 C17.6146949,25.136612 17.2453532,25.1764706 16.9790072,25.1462552 C16.3538159,25.8193507 14.8265909,26 13.9448939,26 C13.1655368,26 10.1524164,25.9498554 10.1524164,24.6441659 C10.1524164,24.0816458 10.2750929,23.9209257 10.6752679,23.5596271 C10.9927837,23.4991964 11.2289526,23.3288332 11.5976383,23.308261 C11.6488082,23.308261 11.6901378,23.2979749 11.7413077,23.2883317 C11.7518041,23.2780456 11.7616444,23.2780456 11.7616444,23.2478303 L11.7413077,23.2176149 C11.0341133,23.0568949 10.0395802,21.3089039 9.88607043,20.5856638 L9.83490051,20.5554484 C9.76339383,20.5554484 9.73256068,20.7058823 9.71222393,20.7566699 C9.48655151,21.2690453 8.95385963,21.8212793 8.35884541,21.8817101 L8.34834901,21.8817101 C8.26634594,21.8817101 8.29717911,21.80135 8.23551279,21.7814208 C8.09184343,21.4496946 8,21.1488267 8,20.7765992 C8,18.7675989 8.98403674,17.2812601 10.5834245,16.0957891 Z" id="路径" fill="#4DB0EB"></path>
                            </g>
                            <g id="微信登录" transform="translate(56.000000, 0.000000)">
                                <g id="椭圆形">
                                    <use fill="black" fill-opacity="1" filter="url(#filter-9)" xlinkHref="#path-8"></use>
                                    <use fill="#FFFFFF" fill-rule="evenodd" xlinkHref="#path-8"></use>
                                </g >
                                <path d="M20.1966365,13.4339564 C20.4033008,13.4339564 20.6078158,13.452063 20.8105842,13.4798381 C20.2588136,10.3359161 17.5121195,8 14.376687,8 C10.8712484,8 8,10.9232684 8,14.6358365 C8,16.7795828 8.95526936,18.5385239 10.5516445,19.9037935 L9.91386996,22.2509783 L12.1430492,20.8833016 C12.9406539,21.0761823 13.580685,21.2751231 14.3766524,21.2751231 C14.5767634,21.2751231 14.7751096,21.262896 14.9719623,21.2440294 C14.8474261,20.7226713 14.7751278,20.1763441 14.7751278,19.6089907 C14.7751624,16.2000914 17.1674849,13.4339564 20.1966365,13.4339564 Z M16.7230332,11.1598711 C17.2675058,11.1598711 17.7088629,11.6999844 17.7088629,12.3662711 C17.7088629,13.0325578 17.267504,13.5726488 16.7230332,13.5726488 C16.1785243,13.5726488 15.7371671,13.0325355 15.7371671,12.3662711 C15.7371671,11.7000067 16.1785607,11.1598711 16.7230332,11.1598711 Z M12.2614875,13.5969715 C11.717015,13.5969715 11.2756214,13.0568582 11.2756214,12.3905938 C11.2756214,11.7243294 11.7170168,11.184216 12.2614875,11.184216 C12.8059965,11.184216 13.2473718,11.7243294 13.2473718,12.3905938 C13.2473718,13.0568359 12.8059965,13.5969715 12.2614875,13.5969715 Z M25.9715898,19.5406385 C25.9715898,16.4209924 23.4205827,13.8780317 20.5553029,13.8780317 C17.5212554,13.8780317 15.131736,16.4209924 15.131736,19.5406385 C15.131736,22.6656738 17.5212554,25.2030893 20.5553029,25.2030893 C21.1902379,25.2030893 21.8308155,25.0069568 22.46859,24.8113347 L24.2177321,25.9836567 L23.7380412,24.033638 C25.0180507,22.8585991 25.9715898,21.3004465 25.9715898,19.5406385 Z M18.8890701,18.6661014 C18.5013351,18.6661014 18.187044,18.2814298 18.187044,17.8069985 C18.187044,17.3325228 18.5013533,16.9479403 18.8890701,16.9479403 C19.2767868,16.9479403 19.5910962,17.332545 19.5910962,17.8069985 C19.5911344,18.2814521 19.2767887,18.6661014 18.8890701,18.6661014 Z M22.3945451,18.7148336 C22.0067737,18.7148336 21.6925008,18.3301843 21.6925008,17.8557754 C21.6925008,17.3812773 22.0067919,16.9967171 22.3945451,16.9967171 C22.7822618,16.9967171 23.0965712,17.3812996 23.0965712,17.8557754 C23.0965912,18.3301843 22.7822637,18.7148336 22.3945451,18.7148336 Z" id="形状" fill="#4FB473" fill-rule="nonzero"></path>
                            </g >
                            <g id="微博登录" transform="translate(112.000000, 0.000000)">
                                <g id="椭圆形">
                                    <use fill="black" fill-opacity="1" filter="url(#filter-11)" xlinkHref="#path-10"></use>
                                    <use fill="#FFFFFF" fill-rule="evenodd" xlinkHref="#path-10"></use>
                                </g >
                                <path d="M15.4534078,10.7175487 C14.1863687,10.5846797 11.2460335,11.7830084 8.49877095,17.3635097 C8.49877095,17.3635097 6.48357542,21.8785515 10.5843575,24.5860724 C10.5843575,24.5860724 14.0073743,27.1231198 18.8422346,25.3406685 C18.8422346,25.3406685 23.747486,23.3175487 23.2989944,19.075766 C23.2989944,19.075766 22.9269274,17.3183844 21.1932961,16.8044568 C21.1932961,16.8044568 20.658324,16.7167131 20.96,16.0498607 C20.96,16.0498607 21.7282682,14.0969359 20.227933,13.2922006 C20.227933,13.2922006 18.8905028,12.8935933 17.267486,13.9139276 C17.267486,13.9139276 16.1995531,14.6685237 16.7124022,13.0264624 C16.7003352,13.0064067 16.9497207,10.8754875 15.4534078,10.7175487 Z M20.3385475,19.8754875 C20.3385475,22.1844011 17.9472626,24.7214485 15.0210056,24.7214485 C11.5818994,24.7214485 9.70346369,22.8512535 9.70346369,20.5222841 C9.70346369,18.2133705 12.4145251,15.9871866 15.3548603,15.9871866 C18.2871508,15.9871866 20.3385475,17.5665738 20.3385475,19.8754875 Z" id="形状" fill="#EA5D5C" fill-rule="nonzero"></path>
                                <path d="M17.3760894,20.6802228 C17.2896089,22.3674095 16.1452514,23.6810585 14.6288268,23.7487465 C12.7926257,23.8364903 11.5818994,22.7910864 11.7950838,20.7228412 C11.9579888,19.0356546 13.132514,17.6091922 14.6288268,17.6091922 C16.1452514,17.6116992 17.4826816,18.6320334 17.3760894,20.6802228 L17.3760894,20.6802228 Z M15.5760894,20.2289694 C15.5760894,19.9807799 15.4131844,19.7852368 15.2201117,19.7852368 C15.0270391,19.7852368 14.8641341,19.9883008 14.8641341,20.2289694 C14.8641341,20.4696379 15.0270391,20.6727019 15.2201117,20.6727019 C15.4131844,20.6977716 15.5760894,20.5022284 15.5760894,20.2289694 Z M14.6147486,21.3019499 C14.6147486,20.7002786 14.166257,20.2114206 13.667486,20.2991643 C13.1687151,20.3869081 12.6860335,20.8582173 12.6860335,21.4523677 C12.6860335,22.054039 13.098324,22.4977716 13.6111732,22.4977716 C14.1300559,22.5253482 14.6147486,21.9036212 14.6147486,21.3019499 L14.6147486,21.3019499 Z M20.2299441,10.0331476 C20.3164246,9.98802228 20.3928492,9.97047354 20.4793296,9.9454039 C20.5658101,9.92534819 20.658324,9.90027855 20.7649162,9.88272981 C20.4592179,9.92785515 20.7146369,9.90278552 20.7649162,9.88272981 C20.8353073,9.88272981 20.9077095,9.86267409 20.9982123,9.86267409 L21.4467039,9.86267409 C21.5331844,9.86267409 21.6096089,9.88272981 21.6960894,9.88272981 C21.4627933,9.83760446 21.6256983,9.86267409 21.68,9.88272981 C21.7363128,9.90278552 21.7865922,9.90278552 21.8589944,9.92785515 C22.0379888,9.9729805 22.2149721,10.0356546 22.3939665,10.1309192 C22.4442458,10.1509749 22.4804469,10.1760446 22.5367598,10.1935933 C22.3577654,10.1058496 22.5206704,10.1935933 22.5528492,10.1935933 C22.6594413,10.2562674 22.7660335,10.3264624 22.8887151,10.4167131 C22.9751955,10.4793872 23.0878212,10.5696379 23.1743017,10.6398329 C23.224581,10.6849582 23.2607821,10.7275766 23.317095,10.7727019 C23.1743017,10.6398329 23.3331844,10.7927577 23.3532961,10.8178273 C23.5524022,11.0208914 23.7253631,11.2364903 23.9083799,11.4846797 C23.9244693,11.5047354 24.0511732,11.7077994 23.9244693,11.5047354 C23.9606704,11.5498607 23.9747486,11.6125348 24.0109497,11.6576602 C24.0612291,11.7654596 24.1175419,11.8807799 24.1738547,11.9685237 C24.2241341,12.0763231 24.2603352,12.1916435 24.2965363,12.3044568 C24.3669274,12.5075209 24.246257,12.1013928 24.2965363,12.3044568 C24.3126257,12.3671309 24.3327374,12.4373259 24.3669274,12.5275766 C24.4172067,12.7306407 24.4534078,12.9462396 24.4896089,13.1743733 C24.4896089,13.2194986 24.5056983,13.2821727 24.5056983,13.3272981 C24.4694972,13.0364903 24.4896089,13.2194986 24.5056983,13.2821727 C24.5217877,13.3899721 24.5217877,13.5052925 24.5217877,13.6381616 C24.5217877,13.816156 24.5217877,14.0192201 24.5056983,14.1972145 C24.5056983,14.2849582 24.4896089,14.3752089 24.4896089,14.4629526 C24.5258101,14.1069638 24.4896089,14.4629526 24.4735196,14.5256267 C24.4373184,14.7738162 24.3870391,14.989415 24.3307263,15.2175487 C24.2945251,15.3504178 24.1678212,15.681337 24.3146369,15.2802228 C24.1517318,15.7239554 24.2080447,16.2579387 24.5841341,16.5236769 C24.9039106,16.7467967 25.4227933,16.656546 25.581676,16.1877437 C26.0301676,14.9643454 26.116648,13.4977716 25.8149721,12.1866295 C25.28,9.8275766 23.4236872,8.2281337 21.5150838,8.03259053 C20.9801117,7.98746518 20.390838,8.03259053 19.892067,8.25571031 C19.52,8.4086351 19.2665922,8.87743733 19.3731844,9.36629526 C19.427486,9.8551532 19.8538547,10.2086351 20.2299441,10.0331476 L20.2299441,10.0331476 Z" id="形状" fill="#EA5D5C" fill-rule="nonzero"></path>
                                <path d="M20.6020112,12.5626741 C20.6522905,12.5426184 20.6884916,12.5426184 20.7448045,12.5175487 C20.9077095,12.4724234 20.658324,12.5175487 20.7950838,12.5175487 C20.8654749,12.5175487 20.9579888,12.497493 21.0283799,12.497493 C21.3139665,12.497493 21.633743,12.5852368 21.8670391,12.8534819 C21.9032402,12.8986072 21.9374302,12.9412256 21.9897207,12.986351 C21.9897207,12.986351 22.0963128,13.1392758 22.04,13.0740947 C22.0762011,13.1192201 22.0902793,13.1818942 22.1103911,13.2270195 C22.1305028,13.2721448 22.1465922,13.2896936 22.1465922,13.3348189 C22.1305028,13.2896936 22.1305028,13.2896936 22.1465922,13.3548747 C22.1827933,13.4626741 22.1968715,13.5779944 22.2169832,13.6908078 C22.2531844,13.8688022 22.2169832,13.5830084 22.2169832,13.7359331 L22.2169832,14.2047354 C22.2169832,14.2498607 22.2169832,14.2924791 22.2008939,14.3125348 C22.2169832,14.1094708 22.2008939,14.2924791 22.2008939,14.3125348 C22.1848045,14.3752089 22.1848045,14.4454039 22.1646927,14.5155989 C22.0943017,14.8264624 22.2511732,15.1824513 22.5005587,15.2501393 C22.7700559,15.337883 23.0194413,15.1423398 23.0898324,14.8314763 C23.3392179,13.8286908 23.1401117,12.6504178 22.5005587,11.9660167 C21.9313966,11.3192201 21.0344134,11.0961003 20.2882682,11.3643454 C19.7472626,11.6100279 20.0167598,12.7657382 20.6020112,12.5626741 L20.6020112,12.5626741 Z" id="路径" fill="#EA5D5C"></path>
                            </g >
                        </g >
                        <line x1="68.5" y1="377.5" x2="306.5" y2="377.5" id="直线-2" stroke="#F4F4F4" stroke-linecap="square"></line>
                        <line x1="68.5" y1="434.5" x2="306.5" y2="434.5" id="直线-3" stroke="#F4F4F4" stroke-linecap="square"></line>
                        <text id="请输入用户名" font-family="PingFangSC-Regular, PingFang SC" font-size="14" font-weight="normal" fill="#C6C6C6">
                            <tspan x="68" y="360">请输入用户名</tspan>
                        </text>
                        <text id="请输入密码" font-family="PingFangSC-Regular, PingFang SC" font-size="14" font-weight="normal" fill="#C6C6C6">
                            <tspan x="68" y="419">请输入密码</tspan>
                        </text>
                        <rect id="矩形" fill="url(#linearGradient-12)" x="69" y="479" width="238" height="40" rx="20"></rect>
                        <text id="登-录" font-family="PingFangSC-Regular, PingFang SC" font-size="16" font-weight="normal" fill="#FFFFFF">
                            <tspan x="170" y="505.5">登 录</tspan>
                        </text>
                        <text id="忘记密码" font-family="PingFangSC-Regular, PingFang SC" font-size="12" font-weight="normal" fill="#C6C6C6">
                            <tspan x="165" y="543">忘记密码</tspan>
                        </text>
                        <g id="Bars/Status/Black" transform="translate(0.000000, -2.000000)">
                            <g id="Pin-Right" stroke-width="1" fill-rule="evenodd" transform="translate(298.000000, 3.000000)">
                                <g id="Battery" transform="translate(9.000000, 0.000000)">
                                    <g transform="translate(36.000000, 1.500000)">
                                        <path d="M20.7951435,0.5 L3.2048565,0.5 C2.23205669,0.5 1.87226874,0.583615246 1.5147423,0.774822479 C1.19575795,0.945417173 0.945417173,1.19575795 0.774822479,1.5147423 C0.583615246,1.87226874 0.5,2.23205669 0.5,3.2048565 L0.5,8.2951435 C0.5,9.26794331 0.583615246,9.62773126 0.774822479,9.9852577 C0.945417173,10.304242 1.19575795,10.5545828 1.5147423,10.7251775 C1.87226874,10.9163848 2.23205669,11 3.2048565,11 L22.0738202,11 C22.4676488,11 22.8241938,10.8403694 23.0822816,10.5822816 C23.3403694,10.3241938 23.5,9.96764884 23.5,9.57382015 L23.5,3.2048565 C23.5,2.23205669 23.4163848,1.87226874 23.2251775,1.5147423 C23.0545828,1.19575795 22.804242,0.945417173 22.4852577,0.774822479 C22.1277313,0.583615246 21.7679433,0.5 20.7951435,0.5 Z" id="Border" stroke="#000000" opacity="0.400000006"></path>
                                        <path d="M25.0004626,4.00011912 C25.8628415,4.22230136 26.5,5.00523813 26.5,5.93699126 C26.5,6.86874438 25.8628415,7.65168116 25.0004626,7.8738634 Z" id="Nub" fill="#000000" opacity="0.400000006"></path>
                                        <path d="M2.5,2 L21.5,2 C21.7761424,2 22,2.22385763 22,2.5 L22,9 C22,9.27614237 21.7761424,9.5 21.5,9.5 L2.5,9.5 C2.22385763,9.5 2,9.27614237 2,9 L2,2.5 C2,2.22385763 2.22385763,2 2.5,2 Z" id="Charge" fill="#000000"></path>
                                    </g>
                                    <text id="100%" font-family="Helvetica" font-size="12" font-weight="normal" fill="#030303">
                                        <tspan x="2.30859375" y="11.5">100%</tspan>
                                    </text>
                                </g>
                                <polyline id="Bluetooth" stroke="#000000" points="0.5 4 6.5 9.5 3.5 12 3.5 2 6.5 4.5 0.5 10"></polyline>
                            </g>
                            <text id="Time" font-family="Helvetica" font-size="12" font-weight="normal" fill="#030303">
                                <tspan x="165.155273" y="14.5">9:41 AM</tspan>
                            </text>
                            <g id="Overrides/Status-Bar/Signal---Black" fill-rule="evenodd" stroke-width="1">
                                <g id="Group" transform="translate(6.000000, 3.000000)">
                                    <text id="Carrier" font-family="Helvetica" font-size="12" font-weight="normal" fill="#030303">
                                        <tspan x="20" y="11.5">Sketch</tspan>
                                    </text>
                                    <path d="M2,7.5 C2.55228475,7.5 3,7.94771525 3,8.5 L3,11 C3,11.5522847 2.55228475,12 2,12 L1,12 C0.44771525,12 6.76353751e-17,11.5522847 0,11 L0,8.5 C-6.76353751e-17,7.94771525 0.44771525,7.5 1,7.5 L2,7.5 Z M6.5,6 C7.05228475,6 7.5,6.44771525 7.5,7 L7.5,11 C7.5,11.5522847 7.05228475,12 6.5,12 L5.5,12 C4.94771525,12 4.5,11.5522847 4.5,11 L4.5,7 C4.5,6.44771525 4.94771525,6 5.5,6 L6.5,6 Z M11,4 C11.5522847,4 12,4.44771525 12,5 L12,11 C12,11.5522847 11.5522847,12 11,12 L10,12 C9.44771525,12 9,11.5522847 9,11 L9,5 C9,4.44771525 9.44771525,4 10,4 L11,4 Z M15.5,2 C16.0522847,2 16.5,2.44771525 16.5,3 L16.5,11 C16.5,11.5522847 16.0522847,12 15.5,12 L14.5,12 C13.9477153,12 13.5,11.5522847 13.5,11 L13.5,3 C13.5,2.44771525 13.9477153,2 14.5,2 L15.5,2 Z" id="Mobile-Signal" fill="#000000"></path>
                                    <path d="M65.3295628,4.82956276 C67.2063161,3.07441257 69.7276868,2 72.5,2 C75.2723132,2 77.7936839,3.07441257 79.6704372,4.82956276 L78.2552384,6.24476162 C76.7412564,4.85107918 74.7200183,4 72.5,4 C70.2799817,4 68.2587436,4.85107918 66.7447616,6.24476162 L65.3295628,4.82956276 L65.3295628,4.82956276 Z M67.8065309,7.30653087 C69.0481225,6.18377399 70.6942093,5.5 72.5,5.5 C74.3057907,5.5 75.9518775,6.18377399 77.1934691,7.30653087 L75.7767384,8.72326155 C74.8991992,7.96124278 73.7534641,7.5 72.5,7.5 C71.2465359,7.5 70.1008008,7.96124278 69.2232616,8.72326155 L67.8065309,7.30653087 Z M70.2877088,9.78770884 C70.890654,9.29532392 71.6608387,9 72.5,9 C73.3391613,9 74.109346,9.29532392 74.7122912,9.78770884 L72.5,12 L70.2877088,9.78770884 L70.2877088,9.78770884 Z" id="Wifi" fill="#000000"></path>
                                </g>
                            </g>
                        </g>
                    </g >

                </svg >
            </div >
        )
    }
}
export default SVGTest;
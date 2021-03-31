import React from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, List, WhiteSpace, WingBlank, Checkbox, SwipeAction, Switch, NavBar, Icon, InputItem, Toast, Button, ImagePicker } from 'antd-mobile';
import { Widget, addResponseMessage, toggleWidget, dropMessages, addLinkSnippet, addUserMessage, renderCustomComponent } from 'react-chat-widget';
import 'antd-mobile/dist/antd-mobile.css';
import HttpService from '../../util/HttpService.jsx';
import { result } from 'lodash';
import { createForm } from 'rc-form';
import './AssetDetail.css';


class AssetDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            action: this.props.match.params.action,
            id: this.props.match.params.id,
            isReadOnly: this.props.match.params.action == 'readOnly',
            files: []
        };
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        HttpService.post("reportServer/asset/getAssetById", JSON.stringify({ asset_id: this.state.id }))
            .then(res => {
                if (res.resultCode == "1000") {
                    this.props.form.setFieldsValue(res.data);
                    this.setState({
                        files: [
                            {
                                url: `${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=${res.data.image}`,
                                fileName: res.data.image
                            }
                        ],
                    })
                }
                else
                    Toast.error(res.message);

            });

    }

    updateAsset() {
        let formInfo = this.props.form.getFieldsValue();
        if (0 < this.state.files.length) {
            formInfo.image = this.state.files[0].fileName;
        } else {
            formInfo.image = '';
        }
        formInfo.asset_id = this.state.id;
        console.log("提交数据", formInfo);
        HttpService.post("reportServer/asset/UpdateAsset", JSON.stringify(formInfo))
            .then(res => {
                if (res.resultCode == "1000") {
                    Toast.success(`报错成功！`)
                }
                else {
                    Toast.error(res.message);
                }

            });
        window.location.href = "#/Asset/AssetList"
    }

    onChange = (files, type, index) => {
        console.log(files, type, index);
        if (type == 'add') { //新增则执行上传操作
            this.uploadAssetImg(files)
        } else {
            this.setState({
                files,
            });
        }
    };

    //上传图片
    async uploadAssetImg(files) {
        let newFiles = [];

        for (let key in files) {
            if (typeof files[key].file == 'undefined') {
                newFiles.push(files[key]);
            } else {
                let formData = new FormData();
                formData.append("file", files[key].file);
                await HttpService.post("/reportServer/uploadAssetImg/uploadAssetImg", formData).then(response => {
                    console.log("上传结果：", response)
                    if (response.resultCode == '1000') {
                        console.log("上传成功：", response.data)
                        //上传成功
                        newFiles.push({
                            url: `${window.getServerUrl()}reportServer/uploadAssetImg/downloadAssetImg?fileName=${response.data.fileName}`,
                            fileName: response.data.fileName
                        });
                    } else {
                        Toast.fail(response.message)
                    }

                }).catch((err) => {
                    Toast.fail(err)
                });
            }
        }

        console.log('newFiles', newFiles);
        this.setState({
            files: newFiles,
        });
    }


    onSegChange = (e) => {
        const index = e.nativeEvent.selectedSegmentIndex;
        this.setState({
            multiple: index === 1,
        });
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
                            this.updateAsset();
                        }}>确定</div>
                    ]}
                    onLeftClick={() => window.location.href = "#/Asset/AssetList"}
                >
                    <span style={{ color: 'white' }}>资产详情</span>
                </NavBar>
                <List renderHeader={() => '基础信息'}>
                    <InputItem
                        {...getFieldProps('asset_tag')}
                        clear
                        editable={false}
                        ref={el => this.autoFocusInst = el}
                    ><span style={{ fontSize: '15px' }}>
                            资产标签号
                        </span></InputItem>
                    <InputItem
                        style={{ color: 'black' }}
                        {...getFieldProps('iot_num')}
                        clear
                        ref={el => this.inputRef = el}
                    >物联网编号</InputItem>
                    <InputItem
                        {...getFieldProps('asset_name')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >资产名称</InputItem>

                    <InputItem
                        {...getFieldProps('typeCode')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >资产类别编码</InputItem>


                    <InputItem
                        {...getFieldProps('typeName')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >资产类别描述</InputItem>
                    <InputItem
                        {...getFieldProps('productor')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >生产厂商</InputItem>

                    <InputItem
                        {...getFieldProps('model')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >规格型号</InputItem>
                    <InputItem
                        {...getFieldProps('amount')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >数量</InputItem>

                </List>
                <List renderHeader={() => '使用信息'}>
                    <InputItem
                        {...getFieldProps('startDate')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >启用日期</InputItem>
                    <InputItem
                        {...getFieldProps('focus')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >折旧年限</InputItem>
                    <InputItem
                        {...getFieldProps('lifeInYears')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >剩余折旧月数</InputItem>
                    <InputItem
                        {...getFieldProps('lifeInMonth')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >责任部门</InputItem>


                    <InputItem
                        {...getFieldProps('dutyDeptName')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >责任人编码</InputItem>
                    <InputItem
                        {...getFieldProps('dutyName')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >责任人</InputItem>

                    <InputItem
                        {...getFieldProps('useDeptName')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >使用部门</InputItem>
                    <InputItem
                        {...getFieldProps('userCode')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >使用人编码</InputItem>

                    <InputItem
                        {...getFieldProps('userName')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >使用人</InputItem>
                    <InputItem
                        {...getFieldProps('addressCode')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >资产地点编号</InputItem>
                    <InputItem
                        {...getFieldProps('addressName')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >资产地点描述</InputItem>
                </List>

                <List renderHeader={() => '财务信息'}>


                    <InputItem
                        {...getFieldProps('cost')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >原值</InputItem>
                    <InputItem
                        {...getFieldProps('netValue')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >净值</InputItem>
                    <InputItem
                        {...getFieldProps('netQuota')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >净额</InputItem>

                    <InputItem
                        {...getFieldProps('residualValue')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >残值</InputItem>
                    <InputItem
                        {...getFieldProps('periodDepreciation')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >本期折旧</InputItem>
                    <InputItem
                        {...getFieldProps('yearDepreciation')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >本年折旧</InputItem>

                    <InputItem
                        {...getFieldProps('cumulativeDepreciation')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >累计折旧</InputItem>
                    <InputItem
                        {...getFieldProps('periodImpairment')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >本期减值</InputItem>
                    <InputItem
                        {...getFieldProps('yearImpairment')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >本年减值</InputItem>
                    <InputItem
                        {...getFieldProps('cumulativeImpairment')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >累计减值</InputItem>
                    <InputItem
                        {...getFieldProps('asset_img')}
                        clear
                        editable={false}
                        ref={el => this.inputRef = el}
                    >资产图片</InputItem>

                    <ImagePicker
                        files={this.state.files}
                        onChange={this.onChange}
                        onImageClick={(index, fs) => console.log(index, fs)}
                        selectable={this.state.files.length < 1}
                        multiple={false}
                        capture={true}
                    />

                </List>
            </div >
        )
    }
}

export default createForm()(AssetDetail);

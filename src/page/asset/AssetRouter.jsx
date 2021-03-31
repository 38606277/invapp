import React from 'react';
import { HashRouter as Router, Switch, Redirect, Route, Link } from 'react-router-dom'
// 页面
import Loadable from 'react-loadable';

import loading from '../../util/loading.jsx'

// import AssetMapGaoDe from './AssetMapGaoDe.jsx';
// import AssetScan from './AssetScan.jsx';
// import AssetList from './AssetList.jsx';
// import AssetDetail from './AssetDetail.jsx';
// import SVGTest from './SVGTest.jsx';

const AssetMapGaoDe = Loadable({
    loader: () => import(/* webpackChunkName: "AssetMapGaoDe" */ './AssetMapGaoDe.jsx'),
    loading: loading,
    delay: 3000
});

const AssetScan = Loadable({
    loader: () => import(/* webpackChunkName: "AssetScan" */ './AssetScan.jsx'),
    loading: loading,
    delay: 3000
});
const AssetList = Loadable({
    loader: () => import(/* webpackChunkName: "AssetList" */ './AssetList.jsx'),
    loading: loading,
    delay: 3000
});
const AssetDetail = Loadable({
    loader: () => import(/* webpackChunkName: "AssetDetail" */ './AssetDetail.jsx'),
    loading: loading,
    delay: 3000
});

const AssetAlarmList = Loadable({
    loader: () => import(/* webpackChunkName: "AssetList" */ './AssetAlarmList.jsx'),
    loading: loading,
    delay: 3000
});


const SVGTest = Loadable({
    loader: () => import(/* webpackChunkName: "SVGTest" */ './SVGTest.jsx'),
    loading: loading,
    delay: 3000
});

const ToastExample = Loadable({
    loader: () => import(/* webpackChunkName: "ToastExample" */ './ToastExample.jsx'),
    loading: loading,
    delay: 3000
});

export default class AssetRouter extends React.Component {
    render() {
        return (
            <Switch>
                <Route path="/Asset/AssetMapGaoDe" component={AssetMapGaoDe} />
                <Route path="/Asset/AssetScan" component={AssetScan} />
                <Route path="/Asset/AssetList" component={AssetList} />
                <Route path="/Asset/AssetDetail/:action/:id" component={AssetDetail} />
                <Route path="/Asset/AssetAlarmList" component={AssetAlarmList} />
                <Route path="/Asset/ToastExample" component={ToastExample} />
            </Switch>
        )
    }
}
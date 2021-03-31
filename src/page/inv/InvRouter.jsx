import React from 'react';
import { HashRouter as Router, Switch, Redirect, Route, Link } from 'react-router-dom'
// 页面
import Loadable from 'react-loadable';
import loading from '../../util/loading.jsx'

const RFIDScan = Loadable({
    loader: () => import(/* webpackChunkName: "RFIDScan" */ './RFIDScan.jsx'),
    loading: loading,
    delay: 3000
});

export default class AssetRouter extends React.Component {
    render() {
        return (
            <Switch>
                <Route path="/Inv/RFIDScan" component={RFIDScan} />
            </Switch>
        )
    }
}
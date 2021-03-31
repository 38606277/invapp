import React from 'react';
import { WhiteSpace, Carousel, Icon, Card, Flex, Toast } from 'antd-mobile';
import 'antd-mobile/dist/antd-mobile.css';
import User from '../service/user-service.jsx'
import LocalStorge from '../util/LogcalStorge.jsx';


const _user = new User();
const localStorge = new LocalStorge();

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }

    }

    componentDidMount() {

    }

    //界面渲染
    render() {
        return (
            <div>





            </div >
        )
    }
}

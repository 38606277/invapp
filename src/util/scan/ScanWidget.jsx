import React, { useState } from 'react';
import './index.css'
import './common.css'



class ScanWidget extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        console.log('ScanWidget componentDidMount')
    }

    render() {
        return (
            <div class="animete-box" style={{ display: "block" }}>

                {/* <div class="animete-boy animete-1 animated heartBeat"></div>
                <div class="animete-girl animete-2 animated heartBeat"></div>
                <div class="animete-girl animete-3 animated heartBeat"></div>
                <div class="animete-boy animete-4 animated heartBeat"></div>
                <div class="animete-girl animete-5 animated heartBeat"></div> */}


                <div class="dot"></div>
                <div class="pulse"></div>
                <div class="pulse2"></div>
            </div>
            // <div>1231231231</div>
        );
    }
}

export default ScanWidget;
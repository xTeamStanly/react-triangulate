import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Triangulation from './Triangulation';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <Triangulation
    //main colors
    topcolor = { "#221A33" }
    botcolor = { "#8A3D99" }

    //points settings
    pointscolor = { "#000000" }
    mincirclesize = { 3 }
    maxcirclesize = { 8 }
    count = { 100 }
    minspeed = { 0.1 }
    maxspeed = { 0.5 }
    pointshadowblur = { 0 }
    pointshadowcolor = { "#00000000" }

    //point color variation
    colorvariance = { false }
    tint = { 0.5 }
    shade = { 0.7 }


    //triangle settings
    triangleshadowblur = { 0 }
    triangleshadowcolor = { "#00000000" }
    linewidth = { 1.0 }
    linecolor = { "#00000000" }

    //config
    fps = { 60 }
    backgroundcolor = { "#00000000" }
  />,
document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

serviceWorkerRegistration.register();

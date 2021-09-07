import { React, useState, useEffect, useRef } from 'react';
import Delaunator from 'delaunator';
import colorConvertor from 'color-convert';

//global config
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

//helper functions
const valueToPercent = (percent, min, max) => {
    return min + percent * (max - min);
}
const generateColorVariant = (hexcolor, tint, shade) => {
    //https://github.com/edelstone/tints-and-shades
    const rgb = colorConvertor.hex.rgb(hexcolor);
    let r = rgb[0]; r = r + ((255 - r) * tint); r = r * shade;
    let g = rgb[1]; g = g + ((255 - g) * tint); g = g * shade;
    let b = rgb[2]; b = b + ((255 - b) * tint); b = b * shade;
    return "#" + colorConvertor.rgb.hex(r, g, b);
}
const edgesOfTriangle = (i) => {
    return [3 * i, 3 * i + 1, 3 * i + 2];
}
const pointsOfTriangle = (delauney, i) => {
    return edgesOfTriangle(i).map(e => delauney.triangles[e]);
}

//main component
const Triangulation = (props) => {
    //upper color
    const topColor = colorConvertor.hex.hsv((props.topcolor) ? props.topcolor : "#221A33");
    const topHue = topColor[0];
    const topSat = topColor[1];
    const topLig = topColor[2];

    //bottom color
    const botColor = colorConvertor.hex.hsv((props.botcolor) ? props.botcolor : "#8A3D99");
    const botHue = botColor[0];
    const botSat = botColor[1];
    const botLig = botColor[2];

    //points
    const pointsColor = (props.pointscolor) ? props.pointscolor : "#000000";
    const minCircleSize = (props.mincirclesize) ? props.mincirclesize : 3;
    const maxCircleSize = (props.maxcirclesize) ? props.maxcirclesize : 8;
    const colorVariance = (props.colorvariance) ? props.colorvariance : false;
    const tintFactor = (props.tint) ? props.tint : 0;
    const shadeFactor = (props.shade) ? props.shade : 1;

    //particles config
    const particleAmount = ((props.count) ? props.count : 100);
    const particleMinSpeed = (props.minspeed) ? props.minspeed : 0.1;
    const particleMaxSpeed = (props.maxspeed) ? props.maxspeed : 0.5;
    const pointShadowBlur = (props.pointshadowblur) ? props.pointshadowblur : 3; //bilo je 5
    const pointShadowColor = (props.pointshadowcolor) ? props.pointshadowcolor : "#000000";

    //global config
    const fps = (props.fps) ? props.fps : 60;
    const backgroundColor = (props.backgroundcolor) ? props.backgroundcolor : "#00000000";
    const lineWidth = (props.linewidth) ? props.linewidth : 0.0;
    const lineColor = (props.linecolor) ? props.linecolor : "#00000000";

    //triangle config
    const triangleShadowBlur = (props.triangleshadowblur) ? props.triangleshadowblur : 0; //stavi veliku vrednost tipa 50 za inner shadow effect
    const triangleShadowColor = (props.triangleshadowcolor) ? props.triangleshadowcolor : "#00000000";

    //list of particles
    let [particles, setParticles] = useState([]);

    //canvas
    let canvasRef = useRef();   //canvas reference
    let canvas = null;          //canvas element
    let ctx = null;             //canvas context

    //executed only once - initialisation
    useEffect(() => {
        init(true); //first time init

        //event - resize
        window.addEventListener('resize', () => {
            canvasHeight = window.innerHeight;
            canvasWidth = window.innerWidth;
            init(false); //init is not first time
        });

        //cleanup
        return () => {
            cancelAnimationFrame(loop);
        }
    }, []);

    //add particles to the list
    const addParticle = (x, y, particleArray) => {
        const amplitude = Math.random() * (particleMaxSpeed - particleMinSpeed) + particleMinSpeed;
        const angle = Math.random() * Math.PI * 2;
        const radius = valueToPercent(Math.random(), minCircleSize, maxCircleSize);

        particleArray.push({
            x: x,
            y: y,
            velocityX: amplitude * Math.cos(angle),
            velocityY: amplitude * Math.sin(angle),
            circleSize: radius,
            circleColor: (colorVariance) ? generateColorVariant(pointsColor, Math.random() * tintFactor, Math.random() * shadeFactor) : pointsColor
        });
    };

    //initialiser function
    const init = (requestAnimationForFirstTime) => {
        canvas = canvasRef.current;
        ctx = canvas.getContext('2d');
        const particlesLocal = [];

        //particles on the edges
        particlesLocal.push({ x: 0, y: 0, velocityX: 0, velocityY: 0, circleSize: 0});
        particlesLocal.push({ x: 0, y: canvasHeight, velocityX: 0, velocityY: 0, circleSize: 0 });
        particlesLocal.push({ x: canvasWidth, y: 0, velocityX: 0, velocityY: 0, circleSize: 0 });
        particlesLocal.push({ x: canvasWidth, y: canvasHeight, velocityX: 0, velocityY: 0, circleSize: 0 });

        for(let i = 0; i < particleAmount; i++) {
            addParticle(
                Math.random() * canvasWidth,
                Math.random() * canvasHeight,
                particlesLocal
            );
        }

        particles = particlesLocal;
        setParticles(particlesLocal);

        if(requestAnimationForFirstTime) {
            setTimeout(() => {
                requestAnimationFrame(loop);
            }, 1000 / fps);
        }
    }

    //loop function
    const loop = () => {
        //TODO save and restore optimisation?
        ctx.save();
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();

        //updating all particles
        let updatedParticles = particles.map((particle, i) => {
            let x = particle.x;
            let y = particle.y;
            let velocityX = particle.velocityX;
            let velocityY = particle.velocityY;

            x += velocityX;
            y += velocityY;

            //X axis bounce
            if(x < 0) {
                x = 0;
                if(velocityX < 0) { velocityX *= -1; }
            } else if(x > canvasWidth) {
                x = canvasWidth;
                if(velocityX > 0) { velocityX *= -1; }
            }

            //Y axis bounce
            if(y < 0) {
                y = 0;
                if(velocityY < 0) { velocityY *= -1; }
            } else if(y > canvasHeight) {
                y = canvasHeight;
                if(velocityY > 0) { velocityY *= -1; }
            }

            //update the particle
            particle.x = x;
            particle.y = y;
            particle.velocityX = velocityX;
            particle.velocityY = velocityY;
        });

        //transforming particles to array that delaunator can accept - Object array wrapper
        let particlesForDelaunator = particles.map(particle => {
            return Object.values(particle);
        });

        //delaunay triangles generated
        const delaunator = Delaunator.from(particlesForDelaunator);

        //draw triangle on canvas
        let drawTriangle = (i, triangle) => {
            ctx.beginPath();
            ctx.moveTo(triangle[0][0], triangle[0][1]);
            ctx.lineTo(triangle[1][0], triangle[1][1]);
            ctx.lineTo(triangle[2][0], triangle[2][1]);
            ctx.closePath();

            ctx.fillStyle = generateColor(
                triangle[0][0],
                triangle[0][1],
                triangle[1][0],
                triangle[1][1],
                triangle[2][0],
                triangle[2][1]
            );

            ctx.shadowColor = triangleShadowColor;
            ctx.shadowBlur = triangleShadowBlur;
            ctx.fill();

            ctx.strokeStyle = lineColor;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        };

        for(let i = 0; i < delaunator.triangles.length / 3; i++) {
            let triangle = pointsOfTriangle(delaunator, i).map(e => particlesForDelaunator[e]);
            drawTriangle(i, triangle);
        }

        ctx.save();
        //skipping first 4 corner particles
        for(let i = 4; i < particles.length; i++) {
            ctx.fillStyle = particles[i].circleColor;
            ctx.shadowColor = pointShadowColor;
            ctx.shadowBlur = pointShadowBlur;
            ctx.beginPath();
            ctx.arc(particles[i].x, particles[i].y, particles[i].circleSize, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        };
        ctx.restore();

        setTimeout(() => {
            requestAnimationFrame(loop);
        }, 1000 / fps);
    };

    const generateColor = (ax, ay, bx, by, cx, cy) => {
        //triangle center coords
        //const triangleCenterX = (ax + bx + cx) / 3;
        const triangleCenterY = (ay + by + cy) / 3;

        const percentDistanceFromFloor = triangleCenterY / canvasHeight;

        //hue saturation lightness
        const hue = valueToPercent(percentDistanceFromFloor, topHue, botHue);
        const sat = valueToPercent(percentDistanceFromFloor, topSat, botSat);
        const lig = valueToPercent(percentDistanceFromFloor, topLig, botLig);

        return "#" + colorConvertor.hsl.hex(hue, sat, lig);

        // //!!! LEGACY CODE !!!//
        // variations of color calculation:
        // 1) based on triangle area
        // const area = Math.abs(0.5 * (ax*(by - cy) + bx*(cy - ay) + cx*(ay - by)));
        //
        // 2) based on distance from a point (ex. distance from center)
        // const distanceFromCenter = Math.sqrt(
        //     Math.pow(triangleCenterX - canvasWidth / 2, 2) +
        //     Math.pow(triangleCenterY - canvasHeight / 2, 2)
        // );
    };

    return(
        <div>
            <canvas
                ref = { canvasRef }
                style = {{
                    position: 'absolute',
                    zIndex: -1,
                    width: "100%",
                    height: "100%"
                }}

                width = { canvasWidth }
                height = { canvasHeight }
            />
        </div>
    );
}

export default Triangulation;
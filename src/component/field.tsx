import * as React from "react";

import {Grid} from "./grid"

import {Snake, Node, Global} from "../App"

interface Props {
    snake: Snake;
    food: {[key:string]:Node}
}

class GridData {
    public x: number = 0;
    public y: number = 0;
    public type: string = "snake"
}

class Field extends React.Component<Props, {}> {
    static defaultProps = {
        snake: undefined,
        food: []
    };

    render() {
        let divStyle: React.CSSProperties = {
            position: "relative",
            height: "500px",
            width: "500px",
            backgroundColor: "#BFE0CE"
        };

        let gridArr = Array<GridData>();//所有类型各格子的渲染数据

        for (let i = 0; i < this.props.snake.body.length; i++) {//生成蛇节点渲染数据
            let node = this.props.snake.body[i];
            let data = new GridData();
            data.x = node.x;
            data.y = node.y;
            data.type = "snake";
            gridArr.push(data);
        }

        for (let i in this.props.food) { //生成食物渲染数据
            let node = this.props.food[i];
            let data = new GridData();
            data.x = node.x;
            data.y = node.y;
            data.type = "food";
            gridArr.push(data);
        }

        let GridReactId = 0;

        return (
            <div style={divStyle}>
                {
                    gridArr.map((item) => (
                    <Grid key = {"Grid_"+GridReactId++} type={item.type} x={item.x*Global.GridSide} y={item.y*Global.GridSide}/>))
                }
            </div>
        )
    }
}

export {Field};


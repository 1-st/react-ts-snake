import React from 'react';
import './App.css';
import {Field} from "./component/field";
import {Score} from "./component/score"
import {Compare, Queue} from "./utils/utils"

//蛇前进的方向
enum Direction {
    Up = 0,
    Down,
    Left,
    Right
}

//蛇的节点
class Node {
    public x: number = 0;
    public y: number = 0;
}

//蛇
class Snake {
    public body: Array<Node> = [];
    public len: number = 2  //初始长度
}

//food食物的定义
// 25:25 => {25:25}
type Food = { [key: string]: Node }

//全局变量
class Global {
    static GridSide: number = 10; //小方格的边长
    static Side: number = 500;   //整个地图的边长
    static Rate: number = 10;   //加速的倍率
}


interface State {
    snake: Snake,
    food: Food,
    score: number
}

//使用App组件承载所有数据
class App extends React.Component<{}, State> {
    static stop: Boolean = false; //游戏结束,显示图片
    static directions: Queue<Direction>;    //前进的方向队列
    static directionChanged: Boolean = false;        //方向发生改变，接下来的动作全部进入动作缓存队列
    static accelerate: Boolean = false;             //是否加速
    static speed: number = 120;       //原始速度

    static gameOver: Boolean = false;  //游戏是否结束
    constructor(props: any) {
        super(props);
        this.state = this.getStartState()
    }

    getStartState(): State {  //得到初始状态

        App.directions = new Queue<number>();
        let randomDirection = Math.floor(Math.random() * 4);
        App.directions.push(randomDirection);

        App.directionChanged = false;
        App.speed = 120;

        let snake = new Snake();
        let head = new Node();  //一开始蛇位置居中
        head.x = (Global.Side / Global.GridSide) / 2;
        head.y = (Global.Side / Global.GridSide) / 2;

        let body = new Node();
        body.x = head.x - 1;
        body.y = head.y;

        switch (randomDirection) {
            case Direction.Up: {
                body.x = head.x;
                body.y = head.y + 1;
                break;
            }
            case Direction.Down: {
                body.x = head.x;
                body.y = head.y - 1;
                break;
            }
            case Direction.Left: {
                body.x = head.x + 1;
                body.y = head.y;
                break;
            }
            case Direction.Right: {
                body.x = head.x - 1;
                body.y = head.y;
                break;
            }
        }

        snake.body.push(head);
        snake.body.push(body);

        let food: Food = {};
        let afood = new Node();
        switch (randomDirection) {
            case Direction.Up: {
                afood.x = head.x;
                afood.y = head.y - 3;
                break;
            }
            case Direction.Down: {
                afood.x = head.x;
                afood.y = head.y + 3;
                break;
            }
            case Direction.Left: {
                afood.x = head.x - 3;
                afood.y = head.y;
                break;
            }
            case Direction.Right: {
                afood.x = head.x + 3;
                afood.y = head.y;
                break;
            }
        }
        food[afood.x.toString() + ":" + afood.y.toString()] = afood;
        return {
            snake: snake,
            food: food,
            score: 0
        }
    }

    calculateNewSnake(origin: Snake): Snake {//计算出下一步蛇的全身位置
        let newSnake = origin;
        let len = origin.len;
        let originX = newSnake.body[0].x;//原来的蛇头位置
        let originY = newSnake.body[0].y;//原来的蛇头位置

        switch (App.directions.peek()) {//计算蛇头
            case Direction.Up : {
                newSnake.body[0].y -= 1;
                break;
            }
            case Direction.Down: {
                newSnake.body[0].y += 1;
                break;
            }
            case Direction.Left: {
                newSnake.body[0].x -= 1;
                break;
            }
            case Direction.Right: {
                newSnake.body[0].x += 1;
                break;
            }
        }
        for (let i = 1; i < len; i++) {
            let saveX = newSnake.body[i].x;
            let saveY = newSnake.body[i].y;
            newSnake.body[i].x = originX;
            newSnake.body[i].y = originY;
            originX = saveX;
            originY = saveY;
        }
        return newSnake
    }

    getNextSpeed() {
        if (App.speed < 1000) {
            App.speed *= 1.1;
        } else {
            App.speed += 10;
        }
    }

    calculateNewFood(snake: Snake) { //计算下一步的食物位置
        let newFood: Food = {};
        let ok: Boolean = false;
        let n = this.state.score / 10 > 0 ? this.state.score / 10 : 1;// 食物的数量
        while (n > 0) {
            for (; !ok;) {
                let x = Math.floor(Math.random() * (Global.Side / Global.GridSide)); //0~49
                let y = Math.floor(Math.random() * (Global.Side / Global.GridSide));
                for (let i = 0; i < snake.len; i++) {
                    if (snake.body[i].x === x && snake.body[i].y === y) {  //与原来的蛇重叠
                        ok = false;
                    }
                }
                for (let i in this.state.food) {
                    if (this.state.food[i].x === x && this.state.food[i].y === y) {
                        ok = false;
                    }
                }
                let newNode: Node = {  //避免浅拷贝
                    x: x,
                    y: y
                };
                newFood[x.toString() + ":" + y.toString()] = newNode;
                ok = true;
            }
            ok = false;
            n--;
        }
        return newFood;
    }

    sideCollisionCheck(newSnake: Snake) { //边界碰撞检测
        if (!Compare.inRange(newSnake.body[0].x, 0, Global.Side / Global.GridSide - 1)) {
            App.gameOver = true;
        } else if (!Compare.inRange(newSnake.body[0].y, 0, Global.Side / Global.GridSide - 1)) {
            App.gameOver = true;
        }
    }

    foodCollisionCheck(snake: Snake): [Snake, Boolean] {  //食物碰撞检测
        let food = this.state.food;
        let copy: Snake = {body: [], len: 0};
        copy.len = snake.len;
        for (let i = 0; i < snake.len; i++) {
            let newNode: Node = {  //避免浅拷贝
                x: snake.body[i].x,
                y: snake.body[i].y
            };
            copy.body.push(newNode)
        }

        let newHead: Node = snake.body[0];
        switch (App.directions.peek()) {//计算蛇头
            case Direction.Up : {
                newHead.y -= 1;
                break;
            }
            case Direction.Down: {
                newHead.y += 1;
                break;
            }
            case Direction.Left: {
                newHead.x -= 1;
                break;
            }
            case Direction.Right: {
                newHead.x += 1;
                break;
            }
        }

        let grow = false;      //蛇是否吃到食物

        if (newHead.x.toString() + ":" + newHead.y.toString() in food) {
            grow = true;
        }

        if (grow) {
            let newNode: Node = {  //避免浅拷贝
                x: copy.body[copy.len - 1].x,
                y: copy.body[copy.len - 1].y
            };
            copy.body.push(newNode);
            for (let i = copy.len - 1; i > 0; i--) {
                copy.body[i].x = copy.body[i - 1].x;
                copy.body[i].y = copy.body[i - 1].y;
            }
            copy.body[0].x = newHead.x;
            copy.body[0].y = newHead.y;
            copy.len++;
        }
        return [copy, grow];
    }

    selfCollisionCheck(newSnake: Snake) {  //自身碰撞检测
        for (let i = 1; i < newSnake.len; i++) {
            if (newSnake.body[i].x === newSnake.body[0].x && newSnake.body[i].y === newSnake.body[0].y) {
                App.gameOver = true;
            }
        }
    }

    componentDidMount() {
        let tick = 0; //经过的秒数*100
        window.addEventListener('keydown', this.handleKeyboardDown); //添加键盘监听
        window.addEventListener('keyup', this.handleKeyboardUp); //添加键盘监听
        setInterval(() => {
            tick++;
            let speed = App.speed;
            if (App.accelerate) {
                speed *= Global.Rate;
            }
            if (tick >= 6000 / speed) { //刷新屏幕
                tick = 0;
                let ret = this.foodCollisionCheck(this.state.snake);  //计算出是否可以吃到食物
                let newSnake = ret[0];
                let grow = ret[1];
                let newFood = this.state.food;
                let newScore = this.state.score;
                if (!grow) {
                    newSnake = this.calculateNewSnake(newSnake);
                } else {
                    newFood = this.calculateNewFood(newSnake);
                    this.getNextSpeed();
                    newScore++;
                }
                this.selfCollisionCheck(newSnake);
                this.sideCollisionCheck(newSnake);

                //=========重要代码
                if(newScore>29){
                    App.stop = true;
                }

                //============
                if (App.gameOver) {
                    this.setState(this.getStartState());
                    App.gameOver = false;
                } else {
                    this.setState({
                        snake: newSnake,
                        food: newFood,
                        score: newScore
                    });
                    App.directionChanged = false;
                    if (App.directions.size() === 2) {
                        App.directions.pop();
                    }
                }
            }
        }, 10);
    }

    handleKeyboardDown(ev: KeyboardEvent) { //处理键盘按下
        switch (ev.key) {
            case " " : {
                if (!App.accelerate) {
                    App.accelerate = true;
                }
                return
            }
        }
        if (App.directions.size() >= 2) {
            return
        }
        switch (ev.key) {
            case "ArrowUp": {
                if (App.directions.peek() !== Direction.Up
                    && App.directions.peek() !== Direction.Down) {
                    if (!App.directionChanged) {
                        App.directions.pop();
                        App.directions.push(Direction.Up);
                        App.directionChanged = true;
                    } else {
                        App.directions.push(Direction.Up);
                    }
                }
                break;
            }
            case "ArrowDown": {
                if (App.directions.peek() !== Direction.Up
                    && App.directions.peek() !== Direction.Down) {
                    if (!App.directionChanged) {
                        App.directions.pop();
                        App.directions.push(Direction.Down);
                        App.directionChanged = true;
                    } else {
                        App.directions.push(Direction.Down);
                    }
                }
                break;
            }
            case "ArrowLeft": {
                if (App.directions.peek() !== Direction.Left
                    && App.directions.peek() !== Direction.Right) {
                    if (!App.directionChanged) {
                        App.directions.pop();
                        App.directions.push(Direction.Left);
                        App.directionChanged = true;
                    } else {
                        App.directions.push(Direction.Left);
                    }
                }
                break;
            }
            case "ArrowRight": {
                if (App.directions.peek() !== Direction.Left
                    && App.directions.peek() !== Direction.Right) {
                    if (!App.directionChanged) {
                        App.directions.pop();
                        App.directions.push(Direction.Right);
                        App.directionChanged = true;
                    } else {
                        App.directions.push(Direction.Right);
                    }
                }
                break;
            }
        }
    }

    handleKeyboardUp(ev: KeyboardEvent) { //处理键盘弹起
        switch (ev.key) {
            case " ": {
                if (App.accelerate) {
                    App.accelerate = false;
                }
                break;
            }
        }
    }

    render() {
        return (
            <div className="App">
                <div className="field">
                    <Field
                        snake={this.state.snake} food={this.state.food}
                    />
                </div>
                <div
                    className="score"
                    style=
                        {{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center"
                        }}
                >
                    <Score score={this.state.score}/>
                </div>
                {App.stop?
                    (<img
                        src ={require("./img/award.jpg")}
                        style={{
                            position: "fixed",
                            left: 0,
                            top: 0,
                            width: "100%",
                            height: "100%",
                        }}/>):<div/>}
            </div>
        )
    }
}

export {App, Snake, Node, Global};

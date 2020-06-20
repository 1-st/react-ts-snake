import * as React from "react"

interface Props {
    x: number,
    y: number,
    type: string
}

//格子
class Grid extends React.Component<Props, {}> {

    static defaultProps = {
        x: 0,
        y: 0
    };

    render() {
        let color:string = "";
        if (this.props.type === "snake"){
            color = "#424242"
        }else if(this.props.type === "food"){
            color = "#ff7437"
        }
        return (
            <div style={{
                left: this.props.x+"px",
                top: this.props.y+"px",
                backgroundColor: color,
                height: "10px",
                width: "10px",
                position: "absolute"
            }}/>
        )
    }
}

export {Grid};
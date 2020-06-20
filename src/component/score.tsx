import * as React from "react"

interface Props {
    score: number,
}

class Score extends React.Component<Props, {}> {
    static defaultProps = {
        score: 0,
    };

    render() {
        return (
            <div>Score:{this.props.score}</div>
        )
    }
}

export  {Score};

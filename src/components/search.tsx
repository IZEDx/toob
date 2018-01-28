
import * as React from "react";
import * as Radium from "radium";
import { getInfo } from "ytdl-core";

const style = {
    search: {
        position: "relative" as "relative",
        height: "55px",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        padding: "10px 30px",
        borderBottom: "solid 1px rgba(0, 0, 0, 0.3)",
        overflow: "hidden" as "hidden"
    },
    icon: {
        position: "absolute" as "absolute",
        right: "20px",
        lineHeight: "55px",
        verticalAlign: "center",
        height: "55px",
        fontSize: "100px",
        color: "rgba(255,255,255,0.15)",
        transition: "transform 1s ease-in"
    },
    input: {
        height: "22px",
        width: "100%",
        paddingTop: "17px",
        lineHeight: "20px",
        background: "transparent",
        fontSize: "20px",
        fontFamily: "Montserrat, bold",
        color: "#e0e2e4",
        border: "none",
        verticalAlign: "bottom",
        ":focus": {
            outline: "none"
        }
    }
}

export interface SearchProps {
    onSearching: (value: string) => void;
    onFound: (id: string, filename: string, title: string) => void;
}

export interface SearchState {
    icon: {
        transform: string
    }
}

export const Search = Radium(class extends React.Component<SearchProps, SearchState> {
    private waitTimer: number|null = null;
    private spinTimer: number|null = null;
    private rotation = 0;
    
    constructor(props: SearchProps) {
        super(props);
        this.state = {
            icon: {
                transform: "rotateZ(0)"
            }
        };
    }

    spinIcon(to?: number) {
        this.rotation = to || (this.rotation + 360);
        this.setState({
            icon: {
                transform: "rotateZ("+this.rotation+"deg)"
            }
        });
    }

    async handleChange(e: {target: {value: string}}) {
        const val = e.target.value;

        if (this.waitTimer !== null) {
            clearTimeout(this.waitTimer);
        }

        await new Promise(resolve => {
            this.waitTimer = setTimeout(resolve, 200);
        })

        if (this.spinTimer) clearInterval(this.spinTimer);
        this.spinTimer = setInterval(this.spinIcon.bind(this), 1000);

        try {
            this.props.onSearching(val);
            const info = await getInfo(val);
            this.props.onFound(info.video_id, info.video_id, info.title);
        } catch(err) {
        }

        if (this.spinTimer) clearInterval(this.spinTimer);
        (async () => this.spinIcon(0))();
    }

    render() {
        return (
            <div style={style.search}>
                <i style={[style.icon, this.state.icon]} className="fa fa-search" aria-hidden="true"></i>
                <input 
                    placeholder="Youtube URL..."
                    style={style.input}
                    onChange={this.handleChange.bind(this)}
                />
            </div>
        );
    }
});
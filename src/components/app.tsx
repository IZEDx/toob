
import * as React from "react";
import * as Radium from "radium";

import { Header } from "./header";
import { Search } from "./search";
import { VideoList, VideoEntry } from "./videolist";

const style = {
    container: {
        background: "linear-gradient(to bottom, #AD2332 150px, #232323 150px)",
        width: "100vw",
        height: "100vh",
        transition: "padding 0.4s",
        padding: "75px 100px",
        boxSizing: "border-box"
    },
    app: {
        minWidth: "500px",
        maxWidth: "1150px",
        width: "100%",
        height: "100%",
        backgroundColor: "#18191A",
        marginLeft: "50%",
        transform: "translateX(-50%)",
        border: "solid 0.5px rgba(255, 255, 255, 0.1)",
        fontSize: "12px",
        fontFamily: "Montserrat, bold",
        boxShadow: "0px 5px 20px -6px rgba(0, 0, 0, 0.4)",
        display: "grid",
        gridTemplateColumns: "200px auto",
        gridTemplateRows: "75px auto 75px",
        backgroundImage: "url(/img/Background_cropped.png",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "calc(0% - 200px) calc(100% + 200px)",
        backgroundSize: "contain",
    }
}

export interface AppState {
    entries: VideoEntry[];
}

export const App = Radium(class extends React.Component<{}, AppState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            entries: []
        }
    }

    handleSearching(value: string) {
    }

    handleFound(id: string, filename: string, title: string, thumbnail: string) {
        if ( this.state.entries.find(e => e.id === id) !== undefined ) {
            return;
        }
        const entries = this.state.entries.slice();
        entries.push({
            id, filename, title, thumbnail
        });
        this.setState({entries});
    }

    render() {
        return (
            <div style={style.container}>
                <div style={style.app}>
                    <Header name="Loadtube" />
                    <Search 
                        onSearching={this.handleSearching.bind(this)}
                        onFound={this.handleFound.bind(this)}
                    />
                    <VideoList entries={this.state.entries}/>
                </div>
            </div>
        );

    }
});
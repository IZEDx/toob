
import { h, Component } from "preact";
import { Login } from "./login";
import { api } from "../api";
import { Settings } from "./settings";

export interface AppProps {
}

interface AppState {
  backgroundImage: string;
  authed: boolean;
  settings: boolean;
  color: string;
  bgtag: string;
}

export class App extends Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = { 
            backgroundImage: "",
            authed: false,
            settings: false,
            color: localStorage.getItem("color") || "#7D7DDD",
            bgtag: localStorage.getItem("bgtag") || "colorful"
        };
    }

    loadBackground(bgtag: string)
    {
        const bg = new Image();
        bg.src = "https://source.unsplash.com/daily?"+bgtag;
        bg.onload = () => {
            this.setState({backgroundImage: bg.src});
        }
    }

    async componentDidMount()
    {
        this.loadBackground(this.state.bgtag);
        const app = document.getElementById("app-container");
        if (app) app.style.setProperty("--bg-color", this.state.color);
    }

    onAuth()
    {
        this.setState({authed: true})
    }

    toggleSettings()
    {
        this.setState({settings: !this.state.settings});
    }
    
    async onLogout()
    {
        const {data} = await api.delete("/auth");
        if (data.success)
        {
            location.reload(true);
        }
        else
        {
            alert(data.error);
        }
    }

    onChangeColor(newColor: string)
    {
        localStorage.setItem("color", newColor);
        const app = document.getElementById("app-container");
        if (app) app.style.setProperty("--bg-color", newColor);
        this.setState({color: newColor});
    }

    onChangeBg(bgtag: string)
    {
        localStorage.setItem("bgtag", bgtag);        
        this.loadBackground(bgtag);
        this.setState({bgtag: bgtag});
    }

    render(props: AppProps, state: AppState) {
        return (
                <div id="app-container">
                    <div 
                        className={`app-background ${this.state.backgroundImage === "" ? "" : "visible"}`} 
                        style={{"backgroundImage": `url(${this.state.backgroundImage})`}} 
                    />
                    <div className="app">
                        <div className="header">
                            <span className="logo" />
                            node-preact-template
                            {!state.authed ? "" : 
                                <div className="right">
                                    <button type="button" onClick={this.toggleSettings.bind(this)} className="btn settings">
                                        <i className="fa fa-gear"></i>
                                    </button>
                                    <button type="button" onClick={this.onLogout.bind(this)} className="btn logout">
                                        <i className="fa fa-sign-out"></i>
                                    </button>
                                </div>
                            }                            
                        </div>
                        <div className="body">
                            <div className={state.settings ? "overlay" : "hidden"}>
                                <Settings onClose={this.toggleSettings.bind(this)} 
                                    color={this.state.color} onChangeColor={this.onChangeColor.bind(this)} 
                                    bgtag={this.state.bgtag} onChangeBg={this.onChangeBg.bind(this)} 
                                />
                            </div>
                            <div className={state.authed ? "hidden" : "overlay"}>
                                <Login onAuth={this.onAuth.bind(this)}/>
                            </div>
                        </div>
                    </div>
                </div>
        );
    }
}
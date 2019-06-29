
import { h, Component } from "preact";
import { Settings, SettingKeys, SettingValues } from "./settings";

export interface AppProps {
}

interface AppState {
  backgroundImage: string;
  settings: boolean;
}

export class App extends Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = { 
            backgroundImage: "",
            settings: false
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
    }

    toggleSettings()
    {
        this.setState({settings: !this.state.settings});
    }

    onChangeColor(newColor: string)
    {
    }

    onChangeBg(bgtag: string)
    {
    }

    onSettingChanged<P extends SettingKeys>(setting: P, value: SettingValues[P])
    {
        switch (setting)
        {
            case "color":
                const app = document.getElementById("app-container");
                if (app) app.style.setProperty("--bg-color", value as string);
                break;

           case "bgtag":      
                this.loadBackground(value as string);
                break;
        }
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
                            toob
                            <div className="right">
                                <button type="button" onClick={this.toggleSettings.bind(this)} className="btn settings">
                                    <i className="fa fa-gear"></i>
                                </button>
                            </div>                  
                        </div>
                        <div className="body">
                            <div className={state.settings ? "overlay" : "hidden"}>
                                <Settings 
                                    onChange={this.onSettingChanged.bind(this)} 
                                    onClose={this.toggleSettings.bind(this)} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
        );
    }
}
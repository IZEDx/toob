
import { h, Component } from "preact";
import { api } from "../api";
import { Input } from "./input";

export interface SettingsProps
{
    color: string;
    bgtag: string;
    onClose(): void;
    onChangeColor(color: string): void;
    onChangeBg(bgtag: string): void;
}
interface SettingsState
{
    color: string;
    bgtag: string;
    password: string;
}

export class Settings extends Component<SettingsProps, SettingsState> {
    constructor(props: SettingsProps) {
        super(props);
        this.state = {
            password: "",
            bgtag: this.props.bgtag,
            color: this.props.color
        };
    }

    async onSetPassword()
    {
        const {data} = await api.put("/auth", {password: this.state.password});
        if (data.success)
        {
            this.props.onClose();
            this.setState({password: ""});
        }
        else
        {
            alert(data.error);
        }
    }

    render() {
        return (
            <div className="settings">
                <div className="setting">
                    <Input type="password" placeholder="Password" onChanged={val => this.setState({password: val})} onSubmit={this.onSetPassword.bind(this)} />
                    <button type="button" onClick={this.onSetPassword.bind(this)} className="btn">
                        <i className="fa fa-save"></i>
                    </button>
                </div>
                <div className="setting">
                    <Input type="text" placeholder="Color" value={this.props.color} onChanged={val => this.setState({color: val})} onSubmit={() => this.props.onChangeColor(this.state.color)} />
                    <button type="button" onClick={() => this.props.onChangeColor(this.state.color)} className="btn">
                        <i className="fa fa-save"></i>
                    </button>
                </div>
                <div className="setting">
                    <Input type="text" placeholder="Background Tag" value={this.props.bgtag} onChanged={val => this.setState({bgtag: val})} onSubmit={() => this.props.onChangeBg(this.state.bgtag)} />
                    <button type="button" onClick={() => this.props.onChangeBg(this.state.bgtag)} className="btn">
                        <i className="fa fa-save"></i>
                    </button>
                </div>
            </div>
        );
    }
}
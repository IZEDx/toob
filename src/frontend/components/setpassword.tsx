
import { h, Component } from "preact";
import { api } from "../api";
import { Input } from "./input";

export interface SetPasswordProps
{
    onChanged(): void;
}
interface SetPasswordState
{
    password: string;
}

export class SetPassword extends Component<SetPasswordProps, SetPasswordState> {
    constructor(props: SetPasswordProps) {
        super(props);
        this.state = {
            password: ""
        };
    }

    async onSetPassword()
    {
        const {data} = await api.put("/auth", {password: this.state.password});
        if (data.success)
        {
            if (this.props.onChanged) this.props.onChanged();
            this.setState({password: ""});
        }
        else
        {
            alert(data.error);
        }
    }

    render() {
        return (
            <div className="setpassword">
                <div className="password">
                    <Input type="password" placeholder="Password" onChanged={val => this.setState({password: val})} onSubmit={this.onSetPassword.bind(this)} />
                </div>
                <button type="button" onClick={this.onSetPassword.bind(this)} className="btn">
                    Set Password
                </button>
            </div>
        );
    }
}
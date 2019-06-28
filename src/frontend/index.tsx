
import { h, render } from "preact";
import { App } from "./components/app";

const appel = document.getElementById("app");

if (appel) {
    render(<App/>, appel);
}
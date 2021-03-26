import React from "react";


import { Panel, Button } from "@vkontakte/vkui";

const Admin = props => (
	<Panel id={props.id}>
        <Button onClick={props.this.go} data-to="serveroff">serveroff panel</Button>
        <Button onClick={props.this.go} data-to="limitoff">limitoff panel</Button>
        <Button onClick={props.this.go} data-to="ban">ban panel</Button>
        <Button onClick={props.this.go} data-to="main">main panel</Button>
        <Button onClick={props.this.go} data-to="clan">clan panel</Button>
	</Panel>
);

export default Admin;
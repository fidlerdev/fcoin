import React from 'react';


import { Icon56ServicesOutline } from '@vkontakte/icons';
import { Panel, Button, Placeholder } from '@vkontakte/vkui';


import '../assets/css/bootstrap.css';
import '../assets/css/style.css';
import '@vkontakte/vkui/dist/vkui.css';


const ServerOff = props => (
	<Panel id={props.id} separator={false}>
           <Placeholder
            icon={<Icon56ServicesOutline />}
            action={<Button size="l" mode="tertiary" onClick={() => window.location.reload()}>Переподключится</Button>}
            stretched
          >
            {props.this.state.kickText}
          </Placeholder>
	</Panel>
);

export default ServerOff;

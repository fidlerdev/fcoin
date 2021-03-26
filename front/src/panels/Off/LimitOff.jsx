import React from 'react';


import { Panel, Button, Placeholder } from '@vkontakte/vkui';
import { Icon56ErrorOutline } from '@vkontakte/icons';


import '../assets/css/bootstrap.css';
import '../assets/css/style.css';
import '@vkontakte/vkui/dist/vkui.css';


const LimitOff = props => (
	<Panel id={props.id} separator={false}>
          <Placeholder
            icon={<Icon56ErrorOutline /> }
            header="Вы были отключены от сервера за неактивность!"
            action={<Button mode="commerce" onClick={props.on}>Переподключится</Button>}
            stretched
          >
            
          </Placeholder>
	</Panel>
);

export default LimitOff;

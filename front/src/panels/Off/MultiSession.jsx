import React from 'react';


import { Icon56ServicesOutline } from '@vkontakte/icons';
import { Panel, Button, Placeholder } from '@vkontakte/vkui';


import '../assets/css/bootstrap.css';
import '../assets/css/style.css';
import '@vkontakte/vkui/dist/vkui.css';


const MultiSession = props => (
	<Panel id={props.id} separator={false}>
           <Placeholder
            icon={<Icon56ServicesOutline />}
            stretched
          >
            Вы были отключены от сервера за использование мульти-сессии.
          </Placeholder>
	</Panel>
);

export default MultiSession;

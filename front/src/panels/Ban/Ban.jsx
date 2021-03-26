import React from 'react';


import { Icon56ErrorOutline } from '@vkontakte/icons';
import { Panel, Button, Placeholder } from '@vkontakte/vkui';


import '../assets/css/bootstrap.css';
import '../assets/css/style.css';
import '@vkontakte/vkui/dist/vkui.css';

const Ban = props => (
	<Panel id={props.id} separator={false}>
           <Placeholder
            icon={<Icon56ErrorOutline fill="ff0000" />}
            action={<Button size="xl" mode="tertiary" href="https://vk.com/aakiimovovh" target="_blank" >Купить разбан</Button>}
            stretched
          >
           {props.reason} <br />  <br /> Приобрести разблокировку можно <br /> за 20 рублей.
          </Placeholder>
	</Panel>
);

export default Ban;

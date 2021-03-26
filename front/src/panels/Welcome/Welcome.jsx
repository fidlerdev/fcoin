import React from "react";


import { Panel, Button, Placeholder } from "@vkontakte/vkui";
import { Icon56DiamondOutline } from '@vkontakte/icons';

const Welcome = props => (
	<Panel id={props.id}>
	 <Placeholder
            icon={<Icon56DiamondOutline />}
            header="Привет!"
            stretched
            action={<Button size="xl" href="https://vk.com/fcoinapp" target="_blank">Перейти</Button>}
          >
            Мини приложение находится на тех-работах.
          </Placeholder>
	</Panel>
);

export default Welcome;
import React from "react";


import { Panel, Button, Group, 
  PanelHeaderBack, Div, Separator, 
  PanelHeader, List, Cell 
} from '@vkontakte/vkui';
import { Icon28RadiowavesAroundOutline,Icon28GhostSimleOutline, Icon28GhostOutline, 
  Icon28EmployeeOutline 
} from '@vkontakte/icons';


const Dop = props => (
	<Panel id={props.id} theme="white" separator={false} header={false}>
	<PanelHeader left={<PanelHeaderBack onClick={() => window.history.back()} />}>  
Информация о клане
  </PanelHeader> 
  <br />
  <center>

                <div>
                    

                    <h1>{props.this.state.claanInfo.name}</h1>
                    
                </div>

            </center>
            <Group >
              <List>
                <Cell indicator={<b>{parseFloat(props.this.state.claanInfo.balance).toFixed(5)} FCOINS</b>} before={<Icon28RadiowavesAroundOutline/>}>Баланс</Cell>
                <Separator />
                <Cell indicator={<b>{parseFloat(props.this.state.claanInfo.voin).toFixed(0)}</b>} before={<Icon28EmployeeOutline />}>Рыцарей </Cell>
                <Cell indicator={<b>{parseFloat(props.this.state.claanInfo.luchniki).toFixed(0)}</b>} before={<Icon28EmployeeOutline />}>Лучников</Cell>
                <Separator />
                <Cell indicator={<b>{parseFloat(props.this.state.claanInfo.win).toFixed(0)}</b>} before={<Icon28GhostOutline />}>Выигрышей </Cell>
                <Cell indicator={<b>{parseFloat(props.this.state.claanInfo.lose).toFixed(0)}</b>} before={<Icon28GhostSimleOutline />}>Проигрышей</Cell>
              </List>
            </Group> 
            {props.this.state.claanInfo.voina && <div>
              {props.this.state.clanInfo.error == null &&
                <div>
                {props.this.state.clanInfo.isAdminInClan &&
          <Div>
          <Button size="xl" onClick={() => {
            window.socket.emit('clanAtack', {
          "vk_user_id": props.this.state.fetchedUser.id,
          "id": props.this.state.claanInfo.id,
          
          "params": window.location.search.substring()
        })
          }}>Напасть на клан</Button>
          </Div>}
          </div>
        }
          </div>}
	</Panel>
);

export default Dop;
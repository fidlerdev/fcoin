import React from 'react';


import {
    Panel, Avatar, PanelHeader, 
    PanelHeaderBack, Search, 
    List, Cell
} from '@vkontakte/vkui';


const Trans = props => (
    <Panel id={props.id}>
		<PanelHeader left={<PanelHeaderBack onClick={() => window.history.back()} />}>Перевод</PanelHeader>
		<Search onChange={props.this.onSearch1Change} after={null}/>
          {props.this.friends.length > 0 &&
            <List>
              {props.this.friends.map(post => 
    			<Cell multiline before={<Avatar shadow={false} size={48} src={post.photo_200} />}
                	description={`Баланс: ${parseFloat(post.balance).toFixed(3)} FCOINS`}
                    onClick={props.this.friendTransfer}
                    data-to={post.id}>
                {post.first_name} {post.last_name}
				</Cell>

    		   )}
            </List>
          }
	</Panel>
);

export default Trans;

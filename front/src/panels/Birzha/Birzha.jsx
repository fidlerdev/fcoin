import React from "react";


import { Panel, Button, Avatar, PanelHeaderBack, 
    Div, Separator, PanelHeader, 
    Search, CardGrid, Card, 
    Cell 
} from '@vkontakte/vkui';
import { Icon28SettingsOutline, Icon28MoneyCircleOutline, Icon28MarketAddBadgeOutline } from '@vkontakte/icons';


function Market(props) {
 
  const content = Object.keys(props.posts).map((post) =>
    <div key={post.user_id}>
{props.posts[post].price !== 99 ?
   <CardGrid>
                        <Card size="l" style={{ color: '#73fffe' }}>
          <Cell before={<Avatar src={props.posts[post].photo} />} description={`100к = ${props.posts[post].price} рублей`} asideContent={<table>
                                <tr>
                                    <td>
                                    <Button onClick={props.buyMarket} data-to={props.posts[post].id}>
                                        Купить
                                        </Button>
                                    </td>
                                    
                                </tr>
                            </table>}>
                                <div
                                    className='market_walletStatsText'>{props.posts[post].name}</div>
                            </Cell>
                             </Card>
                            </CardGrid> : null}
      </div>
  );

  return (
    <div>
     
      {content}
      <br />
      <Div />
    </div>
  );
}


const Dop = props => (
	<Panel id={props.id} theme="white" separator={false} header={false}>
	<PanelHeader left={<PanelHeaderBack onClick={() => window.history.back()} />}>  
Биржа
  </PanelHeader> 
  <Search value={props.this.state.search} onChange={props.this.onSearchChange} after={null} />
  <br />
        <div><CardGrid>
                        <Card size="l" style={{ color: '#73fffe' }}>
          <Cell before={<Icon28MoneyCircleOutline/>} asideContent={<table>
                                <tr>
                                    <td>
                                    <Button onClick={props.this.modal} data-to='popol'>
                                        <div className='market_addButton'><Icon28MarketAddBadgeOutline
                                            width={24} height={24}/></div>
                                            </Button>
                                    </td>
                                    <td>
                                    <Button onClick={props.this.modal} data-to='price'>
                                        <div className='market_addButton'><Icon28SettingsOutline
                                            width={24} height={24}/></div>
                                            </Button>
                                    </td>
                                </tr>
                            </table>}>
                                <div
                                    className='market_walletStatsText'>{props.this.state.rubli} рублей</div>
                            </Cell>
                             </Card>
                            </CardGrid>
                            <br />
                            <Separator />
                            <br />
                            {props.this.state.search < 1 ? <Market posts={props.this.state.market} buyMarket={props.this.buyMarket} id={props.this.state.fetchedUser.id} />   : <Market posts={props.this.state.res} buyMarket={props.this.buyMarket} id={props.this.state.fetchedUser.id} />  }
          
                        
                            </div>
	</Panel>
);

export default Dop;
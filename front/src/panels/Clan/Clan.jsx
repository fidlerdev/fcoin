import React from "react";
import vkConnect from "@vkontakte/vk-bridge";


import { Panel, Button, FixedLayout,
  Div, Avatar, PanelHeaderBack,
  PanelHeader, Group, Placeholder,
  List, File, Cell,
  Tabs, Banner, Input,
  TabsItem, HorizontalScroll
} from "@vkontakte/vkui";
import { Icon28MoneySendOutline, Icon28EmployeeOutline, Icon28UserIncomingOutline,
  Icon56DoNotDisturbOutline, Icon28PictureOutline, Icon28DoorArrowLeftOutline,
  Icon28FavoriteOutline, Icon56GalleryOutline, Icon28CoinsOutline, 
  Icon24Send, Icon28AddCircleOutline
} from '@vkontakte/icons';


const Bonuse = props => (
	<Panel id={props.id}>
	<PanelHeader left={<PanelHeaderBack onClick={() => window.history.back()} />}>  
Клан
  </PanelHeader>
   {props.this.state.clanInfo.error != null ? <div><Placeholder
            icon={<Icon56DoNotDisturbOutline />}
            action={<Button size="l" mode="commerce" onClick={props.this.modal} data-to='newClan'>Создать клан</Button>}
            stretched
          >
            {props.this.state.clanInfo.error}
          </Placeholder>

          </div> : <div>
     <Tabs>
     <HorizontalScroll>
              <TabsItem
                selected={props.this.state.tab1 === 'info'}
                onClick={props.this.set1}
                data-to='info'
              >
               Информация
              </TabsItem>
              <TabsItem
                selected={props.this.state.tab1 === 'members'}
                onClick={props.this.set1}
                data-to='members'
              >
                Состав клана
              </TabsItem>
              <TabsItem
                selected={props.this.state.tab1 === 'bitv'}
                onClick={props.this.set1}
                data-to='bitv'
              >
                Битва
              </TabsItem>
              {props.this.state.clanInfo.isAdminInClan && <TabsItem
                selected={props.this.state.tab1 === 'shop'}
                onClick={props.this.set1}
                data-to='shop'
              >
                Магазин
              </TabsItem> }
              {props.this.state.clanInfo.isAdminInClan && <TabsItem
                selected={props.this.state.tab1 === 'manage'}
                onClick={props.this.set1}
                data-to='manage'
              >
                Управление
              </TabsItem> }
              <TabsItem
                selected={props.this.state.tab1 === 'chat'}
                onClick={props.this.set1}
                data-to='chat'
              >
                Чат
              </TabsItem>
               
              </HorizontalScroll>
            </Tabs>
            {props.this.state.tab1 === 'info' ? <div>
            <br />
          
            {props.this.state.clanInfo.photo == null ? <center><Avatar size={72}><Icon56GalleryOutline height={32}/></Avatar></center> : <center><Avatar size={72} src={props.this.state.clanInfo.photo}></Avatar></center>}
     <center><h2>{props.this.state.clanInfo.name}</h2></center>
      <Group >
              <List>
                <Cell onClick={props.this.modal} data-to='sendClan' indicator={<b>{parseFloat(props.this.state.clanInfo.balance).toFixed(3)} FCOINS</b>} before={<Icon28CoinsOutline/>}>Баланс</Cell>
                <br />
                <Cell indicator={<b>{parseFloat(props.this.state.clanInfo.voin).toFixed(0)}</b>} before={<Icon28EmployeeOutline/>}>Рыцарей</Cell>
                <Cell indicator={<b>{parseFloat(props.this.state.clanInfo.luchiki).toFixed(0)}</b>} before={<Icon28EmployeeOutline/>}>Лучников</Cell>
              </List>
            </Group> 
            <Div>
            <Button size="xl" before={<Icon28DoorArrowLeftOutline />} mode="destructive" onClick={() => {
              window.socket.emit('clanLeave', {
          "vk_user_id": props.this.state.fetchedUser.id,
          "photo": props.this.state.fetchedUser.photo_100,
          "name": props.this.state.fetchedUser.first_name,
          "params": window.location.search.substring()
        })
            }}>Покинуть клан</Button>
            </Div>
     </div>
     : null}
     {props.this.state.tab1 === 'bitv' ? <div>

     {!props.this.state.clanInfo.banClicks && <div><Div>
      <div class="clanBottom">
      <div class="fund">
      <div class="title">Главный приз</div>
      <div class="count">5 000 000 коинов</div>
      </div><div class="cLine">
      <div class="cLine2">
      </div>
      </div>
     
      </div></Div> <Div className='balance'>

                            <p>Осталось кликов</p>
                            <h1>
                               {parseFloat(props.this.state.clanInfo.clicks).toFixed(0)}
                            </h1>
                
                        </Div>
                       <Div>
      
       <Button size="xl" before={<Icon28FavoriteOutline />} onClick={props.this.modal} data-to='clanTop'>Топ</Button>

       </Div>
                           {!props.this.state.clanInfo.banClicks && <FixedLayout vertical="bottom" >

    <Div className="MainPage__clickcoin">
            <Div className="MainPage__clickcoin-inner" onClick={(e) => {
              window.socket.emit('clanClick', {
          "vk_user_id": props.this.state.fetchedUser.id,
          "now": Date.now(),
          "cordX": e.pageX,
          "cordY": e.pageY,
          "params": window.location.search.substring()
        })
            }}>
           
            </Div>
          </Div>
                    </FixedLayout>}
                    </div> }
                    {props.this.state.clanInfo.banClicks && <div><Placeholder
            icon={<center><Avatar size={72} src=""></Avatar></center>}
            header="поч"
            stretched
          >
           поч
          </Placeholder>

          </div>}
     </div> : null}
     {props.this.state.tab1 === 'members' ? <div>
     
      
      {Object.keys(props.this.state.clanInfo.users).map((post) =>
    <div key={post.user_id}>
  
    <Cell multiline before={<Avatar shadow={false} size={48} src={props.this.state.clanInfo.users[post].photo} />}
                           description={`Вложил в казну: ${props.this.state.clanInfo.users[post].inBalance} FCOINS`}
                           
                           
                 >{props.this.state.clanInfo.users[post].name}  (ID: {props.this.state.clanInfo.users[post].id}{props.this.state.clanInfo.users[post].isOwner && props.this.state.clanInfo.users[post].isAdmin && ' ,Создатель'} {!props.this.state.clanInfo.users[post].isOwner && props.this.state.clanInfo.users[post].isAdmin && ' ,Администратор'})
</Cell>

    </div>
  )}
{props.this.state.clanInfo.isAdminInClan &&
      <Cell onClick={() => vkConnect.send("VKWebAppShare", {"link": `https://vk.com/app7776364#invite=${props.this.state.clanInfo.owner}`})} multiline description={`Вы можете пригласить других игроков в клан.`} before={<Avatar shadow={false} size={48}><Icon28AddCircleOutline fill='var(--accent)' /></Avatar>}>Пригласить в клан</Cell>
      }
     </div>
     : null}
     {props.this.state.tab1 === 'shop' ? <div>
     
      
     {props.this.state.clanInfo.isAdminInClan &&<div> <Banner
            onClick={() => {
               window.socket.emit('clanBuy1', {
          "vk_user_id": props.this.state.fetchedUser.id,
          "photo": props.this.state.fetchedUser.photo_100,
          "name": props.this.state.fetchedUser.first_name,
          "params": window.location.search.substring()
        })
            }}
        before={<Avatar size={40}> <Icon28EmployeeOutline fill="572800 " /> </Avatar> }
        header="Рыцарь"
        subheader={`Цена: 100.000 FCOINS`}
      />
      <Banner
       onClick={() => {
               window.socket.emit('clanBuy2', {
          "vk_user_id": props.this.state.fetchedUser.id,
          "photo": props.this.state.fetchedUser.photo_100,
          "name": props.this.state.fetchedUser.first_name,
          "params": window.location.search.substring()
        })
            }}
        before={<Avatar size={40}> <Icon28EmployeeOutline fill="738595 " /> </Avatar> }
        header="Лучник"
        subheader={`Цена: 300.000 FCOINS`}
      /></div>}
      
      
     </div>
     : null}
     {props.this.state.tab1 === 'manage' ? <div>
     
     <Div>
      
       <Button size="xl" before={<Icon28DoorArrowLeftOutline />} mode="commerce" onClick={props.this.modal} data-to='clanKick'>Исключить участника</Button>
     <br />
       <Button size="xl" before={<Icon28UserIncomingOutline />} onClick={props.this.modal} data-to='clanAdmin'>Выдать администратора</Button>
       <br />
       <Button size="xl" before={<Icon28MoneySendOutline />}  onClick={() => {
               window.socket.emit('clanWithdraw', {
          "vk_user_id": props.this.state.fetchedUser.id,
          "photo": props.this.state.fetchedUser.photo_100,
          "name": props.this.state.fetchedUser.first_name,
          "params": window.location.search.substring()
        })
            }}>Вывести из казны</Button>
       <br />
       <File
                  top="Установить аватарку"
                  type="image"
                  onChange={props.this.onImgChange}
                  before={<Icon28PictureOutline />}
                  controlSize="xl"
                  mode="secondary"
                />
       
     </Div>
      
     </div>
     : null}
     {props.this.state.tab1 === 'chat' ? <div>
      {Object.keys(props.this.state.clanInfo.chat).map((post) =>
    <div key={post.user_id}>
  <Div>
 <div class="all_message_wrapp">
 <div style={{display: 'flex'}}>
 <div class="message_avatar">
 <img rel="message_photo" src={props.this.state.clanInfo.chat[post].photo} />
 </div>
 <div class="message_wrapp">
 <div class="message_title" style={{color: "#000"}}>{props.this.state.clanInfo.chat[post].name}
 <div class="flash">
 </div>
 </div>
 <div class="message_text" style={{color: "#000"}}>{props.this.state.clanInfo.chat[post].text}</div>
</div>
</div>
</div>
</Div> 
    
    </div>
  )}
      <br />
  <br />
  <Div />
      <FixedLayout vertical="bottom">
<Cell
asideContent={
<Button onClick={() => {
  window.socket.emit('sendClanMessage', {
          "vk_user_id": props.this.state.fetchedUser.id,
          "photo": props.this.state.fetchedUser.photo_100,
          "text": props.this.state.messageText,
          "name": props.this.state.fetchedUser.first_name,
          "params": window.location.search.substring()
        })
}}
>
<Icon24Send />
</Button>
}
>
<Input name="message" placeholder="Ваше сообщение" onChange={props.this.messageChange} /> </Cell>
</FixedLayout>
</div>
     : null}
     </div>}

	</Panel>
);

export default Bonuse;
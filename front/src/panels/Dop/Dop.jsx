import React from "react";


import { Panel, Button, PanelHeader,
  PanelHeaderBack, Banner, Avatar, 
  Card, SimpleCell, CardGrid
} from '@vkontakte/vkui';
import { Icon28ArrowRightSquareOutline, Icon28BillheadOutline, Icon28CoinsOutline, 
  Icon28MarketLikeOutline, Icon28MagicWandOutline, Icon28InboxOutline, 
  Icon28TargetOutline, Icon28StatisticsOutline, Icon28UserAddOutline,
  Icon28SettingsOutline, Icon28FireOutline, Icon28KeyboardBotsOutline,
  Icon28ReportOutline
} from '@vkontakte/icons';


const Dop = props => (
	<Panel id={props.id} theme="white" separator={false} header={false}>
	<PanelHeader left={<PanelHeaderBack onClick={() => window.history.back()} />}>  
Другое
  </PanelHeader>
  {/*<Banner onClick={props.go} data-to="clan"
                before={<Avatar size={40}> <Icon28TargetOutline fill="#3f8ae0" /> </Avatar> }


        header="Ваш клан"
        subheader="Информация о вашем клане"

      />  
*/}

      <CardGrid size="xl">
        <br />
        <Card style={{ background: '#092047' }}>
					<SimpleCell before={<Icon28CoinsOutline fill="#3f8ae0" />} onClick={props.modal} data-to="promo">Кристаллы</SimpleCell>
				</Card>
        <Card style={{ background: '#092047' }}>
					<SimpleCell before={<Icon28UserAddOutline fill="#3f8ae0" />} onClick={props.modal} data-to="ref">Реферальная система</SimpleCell>
				</Card>
      </CardGrid>
      <CardGrid size="xl">
        <Card style={{ background: '#092047' }}>
					<SimpleCell before={<Icon28MagicWandOutline fill="#3f8ae0" />} onClick={props.addBonuse} data-to="transfer">Бонус за рекламу</SimpleCell>
				</Card>
        <Card style={{ background: '#092047' }}>
					<SimpleCell before={<Icon28MarketLikeOutline fill="#3f8ae0" />} onClick={props.go} data-to="birzha">Биржа</SimpleCell>
				</Card>
      </CardGrid>
      <CardGrid size="xl">
        <Card style={{ background: '#092047' }}>
					<SimpleCell before={<Icon28InboxOutline fill="#3f8ae0" />} onClick={props.modal} data-to="promik">Промокод</SimpleCell>
				</Card>
        <Card style={{ background: '#092047' }}>
					<SimpleCell before={<Icon28StatisticsOutline fill="#3f8ae0" />} onClick={props.go} data-to="history">История баланса</SimpleCell>
				</Card>
      </CardGrid>
      <CardGrid size="xl">
        <Card style={{ background: '#092047' }}>
					<SimpleCell before={<Icon28FireOutline fill="#3f8ae0" />} onClick={props.modal} data-to="fortune">Ежедневная фортуна</SimpleCell>
				</Card>
        <Card style={{ background: '#092047' }}>
					<SimpleCell before={<Icon28KeyboardBotsOutline fill="#3f8ae0" />} onClick={props.modal} data-to="vor">Сейф</SimpleCell>
				</Card>
      </CardGrid>
      <CardGrid size="xl">
        <Card style={{ background: '#092047' }}>
					<SimpleCell before={<Icon28BillheadOutline fill="#3f8ae0" />} onClick={props.go} data-to="bonuse">Достижения</SimpleCell>
				</Card>
        <Card style={{ background: '#092047' }}>
					<SimpleCell before={<Icon28SettingsOutline fill="#3f8ae0" />} onClick={props.modal} data-to="api">Для разработчиков</SimpleCell>
				</Card>
      </CardGrid>
      {props.this.state.fetchedUser.id == 548313221 ? <CardGrid size="xl">
        <Card style={{ background: '#092047' }}>
					<SimpleCell before={<Icon28ReportOutline fill="#3f8ae0" />} onClick={props.go} data-to="admin">Админка</SimpleCell>
				</Card>
      </CardGrid> : null}
        {/*<Banner onClick={props.modal} data-to="promo"
                before={<Avatar size={40}> <Icon28CoinsOutline fill="#3f8ae0" /> </Avatar> }


        header="Кристаллы"

      />	
    <Banner onClick={props.modal} data-to="ref"
                before={<Avatar size={40}> <Icon28UserAddOutline fill="#3f8ae0" /> </Avatar> }


        header="Реферальная система"
        subheader="Приглашай друзей и получай дополнительные FCOINS"

      />  
  <Banner onClick={props.go} data-to="transfer"
                before={<Avatar size={40}> <Icon28ArrowRightSquareOutline fill="#3f8ae0"/> </Avatar> }

        header="Перевести"
        subheader="Перевод другому пользователю"

      />
      
      <Banner onClick={props.go} data-to="birzha"
                before={<Avatar size={40}> <Icon28MarketLikeOutline fill="#3f8ae0"/> </Avatar> }

        header="Биржа"
        subheader="Покупай и продавай FCOINS за реальные деньги"

      />
        <Banner onClick={props.modal} data-to="promik"
                before={<Avatar size={40}> <Icon28InboxOutline fill="#3f8ae0"/> </Avatar> }

        header="Промокод"
        subheader="Активируй промокод и получи на свой счет дополнительные FCOINS. "

      />
      <Banner onClick={props.go} data-to="history"
                before={<Avatar size={40}> <Icon28StatisticsOutline fill="#3f8ae0"/> </Avatar> }

        header="История переводов"
        subheader="Контролируй свои финансы. "

      />
     <Banner onClick={props.modal} data-to="fortune"
                before={<Avatar size={40}> <Icon28FireOutline fill="#3f8ae0"/> </Avatar> }

        header="Ежедневная фортуна"
        subheader="Крути рулетку, получай призы. "

      />
      
        <Banner onClick={props.modal} data-to="vor"
                before={<Avatar size={40}> <Icon28KeyboardBotsOutline fill="#3f8ae0"/> </Avatar> }

        header="Сейф"
        subheader="Взломай сейф и выиграй FCOINS, но, будь осторожен, если тебя поймают, то заберут часть FCOINS."

      />

       <Banner onClick={props.addBonuse}
                before={<Avatar size={40}> <Icon28MagicWandOutline fill="#3f8ae0"/> </Avatar> }

        header="Рекламный бонус"
        subheader="Посмотри рекламу и получи бонус"

      />
      <Banner onClick={props.go} data-to="bonuse"
                before={<Avatar size={40}> <Icon28BillheadOutline fill="#3f8ae0"/> </Avatar> }

        header="Достижения"
        subheader="Выполняй цели и получай Бонусы!"

      />
       <Banner onClick={props.modal} data-to="api"
                before={<Avatar size={40}> <Icon28SettingsOutline fill="#3f8ae0"/> </Avatar> }

        header="Для разработчиков"
        subheader="API Токен для переводов"
       

      />
      */}


    {/*
      <Banner
        mode="image"
        size="m"
        header="10000 FCOINS за подписку"
        subheader={<span>Подпишись на официальное<br />сообщество FCOIN и получите<br />10000 FCOINS на свой счёт</span>}
        background={
          <div
            style={{
              backgroundColor: '#000000',
              backgroundPosition: 'right bottom',
              backgroundSize: '102%',
              backgroundRepeat: 'no-repeat',
            }}
          />
        }
        actions={<Button mode="overlay_primary" href="https://vk.com/fcoinapp" target="_blank" size="l">Подписаться</Button>}
      />
    */}
	</Panel>
);

export default Dop;
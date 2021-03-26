import React from "react";


import { Panel, PanelHeaderBack, PanelHeader, 
  Group, Header, FormLayout, 
  FormStatus, Banner 
} from "@vkontakte/vkui";


const Bonuse = props => (
	<Panel id={props.id}>
	<PanelHeader left={<PanelHeaderBack onClick={() => window.history.back()} />}>  
Достижения
  </PanelHeader>
   <FormLayout>
      <FormStatus header="" mode="valid">
      Выполняй Достижения и получай Бонусы за то, что играешь.
      </FormStatus>
    </FormLayout>
    <Group header={<Header mode="secondary">Баланс</Header>}>
      <Banner
        onClick={props.startDost1}
        header={`Накопить 100 000 FCOINS ${props.this.state.dost1 ? '(Выполнено)' : ""}`}
        subheader="+1 кристалл"
        asideMode="expand"
      />
       <Banner
        onClick={props.startDost2}
        header={`Накопить 500 000 FCOINS ${props.this.state.dost2 ? '(Выполнено)' : ""}`}
        subheader="5 кристаллов"
        asideMode="expand"
      />
       <Banner
        onClick={props.startDost3}
        header={`Накопить 1 000 000 FCOINS ${props.this.state.dost3 ? '(Выполнено)' : ""}`}
        subheader="+10 кристаллов"
        asideMode="expand"
      />
          </Group>
        <Group header={<Header mode="secondary">Кристаллы</Header>}>
      <Banner
      onClick={props.startDost4}
        header={`Накопить 10 кристаллов ${props.this.state.dost4 ? '(Выполнено)' : ""}`}
        subheader="+10 000 FCOINS"
        asideMode="expand"
      />
       
       <Banner
       onClick={props.startDost5}
        header={`Накопить 100 кристаллов ${props.this.state.dost5 ? '(Выполнено)' : ""}`}
        subheader="+100 000 FCOINS"
        asideMode="expand"
      />
          </Group> 
          <Group header={<Header mode="secondary">Рефералы</Header>}>
      <Banner
      onClick={props.startDost6}
        header={`Привлечь 100 человек ${props.this.state.dost6 ? '(Выполнено)' : ""}`}
        subheader="+100 000 FCOINS"
        asideMode="expand"
      />
          </Group> 
           <Group header={<Header mode="secondary">Экосистемные</Header>}>
      <Banner
      onClick={props.startDost7}
        header={`Подписаться на группу ${props.this.state.dost7 ? '(Выполнено)' : ""}`}
        subheader="+10 000 FCOINS"
        asideMode="expand"
      />
          </Group>
	</Panel>
);

export default Bonuse;
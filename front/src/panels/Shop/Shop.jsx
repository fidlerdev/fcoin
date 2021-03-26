import React from 'react';


import { Icon28BombOutline, Icon28DrillOutline } from '@vkontakte/icons';
import { Panel, Group, Tabs, TabsItem, 
  PanelHeaderBack, Avatar, PanelHeader, 
  FixedLayout, Banner 
} from '@vkontakte/vkui';


import '../assets/css/bootstrap.css';
import '../assets/css/style.css';
import '@vkontakte/vkui/dist/vkui.css';


const Shop = props => (
  <Panel id={props.id}>
  <PanelHeader left={<PanelHeaderBack onClick={() => window.history.back()} />}>
Ускорители
  </PanelHeader>

     <Tabs>

              <TabsItem
                selected={props.this.state.shopTab === 'click'}
                onClick={props.this.shopTab}
                data-to='click'
              >
               Клик
              </TabsItem>
               <TabsItem
                selected={props.this.state.shopTab === 'mine'}
                onClick={props.this.shopTab}
                data-to='mine'
              >
                Авто-майнинг
              </TabsItem>

            </Tabs>
   {props.this.state.shopTab === 'click' && <Group>
    <Banner
        onClick={props.buyClick1}
        before={<Avatar size={40}> <Icon28DrillOutline fill="50c878" /> </Avatar> }
        header="Мышка"
        subheader={`+0.0001/клик. • Цена: ${props.click1} FCOINS`}
      />
        <Banner
        before={<Avatar size={40}> <Icon28DrillOutline fill="50c878" /> </Avatar> }
        onClick={props.buyClick2}
        header="Мышка с автокликером"
        subheader={`+0.0005/клик. • Цена: ${props.click2} FCOINS`}
      />
       <Banner
        before={<Avatar size={40}> <Icon28DrillOutline fill="50c878"  /> </Avatar> }
        onClick={props.buyClick3}
        header="Мышка с макросами"
        subheader={`+0.001/клик. • Цена: ${props.click3} FCOINS`}
      />
       <Banner
       onClick={props.buyClick4}
      before={<Avatar size={40}> <Icon28DrillOutline fill="50c878"  /> </Avatar> }
   header="Мышка программиста"
        subheader={`+0.005/клик. • Цена: ${props.click4} FCOINS`}
      />
       <Banner
                before={<Avatar size={40}> <Icon28DrillOutline fill="050c878 "  /> </Avatar> }
onClick={props.buyClick5}
        header="Мышка Сатоси Накамото"
        subheader={`+0.01/клик. • Цена: ${props.click5} FCOINS`}
      />
        <Banner
                before={<Avatar size={40}> <Icon28DrillOutline fill="50c878"  width={28} height={28} /> </Avatar> }
onClick={props.buyClick6}
        header="Мышка хакера"
        subheader={`+0.05/клик. • Цена: ${props.click6} FCOINS`}
      />
        <Banner
                before={<Avatar size={40}> <Icon28DrillOutline fill="50c878"  width={28} height={28} /> </Avatar> }
onClick={props.buyClick7}
        header="Мышка Сноудена"
        subheader={`+0.1/клик. • Цена: ${props.click7} FCOINS`}
      />
        <Banner
                before={<Avatar size={40}> <Icon28DrillOutline fill="50c878"  width={28} height={28} /> </Avatar> }
onClick={props.buyClick8}
        header="Мышка Админа"
        subheader={`+0.5/клик. • Цена: ${props.click8} FCOINS`}
      />
   </Group>
}
    {props.this.state.shopTab === 'mine' && <Group>

       <Banner
                       before={<Avatar size={40}> <Icon28BombOutline fill="50c878" /> </Avatar> }
onClick={props.buyAuto1}
        header="Курсор"
        subheader={`+0.0001/сек. • Цена: ${props.mine1} FCOINS`}
      />
       <Banner
                       before={<Avatar size={40}> <Icon28BombOutline fill="50c878" /> </Avatar> }
onClick={props.buyAuto2}
        header="Видеокарта"
        subheader={`+0.0005/сек. • Цена: ${props.mine2} FCOINS`}
      />
       <Banner
                       before={<Avatar size={40}> <Icon28BombOutline fill="50c878" /> </Avatar> }
 onClick={props.buyAuto3}
        header="Компьютер"
        subheader={`+0.001/сек. • Цена: ${props.mine3} FCOINS`}
      />
       <Banner
                       before={<Avatar size={40}> <Icon28BombOutline fill="50c878" /> </Avatar> }
onClick={props.buyAuto4}
        header="Супер компьютер"
        subheader={`+0.005/сек. • Цена: ${props.mine4} FCOINS`}

      />
       <Banner
                       before={<Avatar size={40}> <Icon28BombOutline fill="50c878" /> </Avatar> }
onClick={props.buyAuto5}
        header="Сервер ВКонтакте"
        subheader={`+0.01/сек. • Цена: ${props.mine5} FCOINS`}
      />
       <Banner
                       before={<Avatar size={40}> <Icon28BombOutline fill="50c878" /> </Avatar> }
onClick={props.buyAuto6}
        header="Квантовый компьютер"
        subheader={`+0.05/сек. • Цена: ${props.mine6} FCOINS`}

      />
       <Banner
                       before={<Avatar size={40}> <Icon28BombOutline fill="50c878" /> </Avatar> }
onClick={props.buyAuto7}
        header="Видеокарта Big Bang"
        subheader={`+0.1/сек. • Цена: ${props.mine7} FCOINS`}

      />
       <Banner
                       before={<Avatar size={40}> <Icon28BombOutline fill="50c878" /> </Avatar> }
onClick={props.buyAuto8}
        header="Сервер FCOIN"
        subheader={`+0.5/сек. • Цена: ${props.mine8} FCOINS`}

      />

      <Banner
                       before={<Avatar size={40}> <Icon28BombOutline fill="000000" /> </Avatar> }
onClick={props.buyAuto9}
        header="Плохой майнер"
        subheader={`+5/сек. • Цена: ${props.mine9} Кристаллов`}

      />
      <Banner
                       before={<Avatar size={40}> <Icon28BombOutline fill="000000" /> </Avatar> }
onClick={props.buyAuto10}
        header="Средний майнер"
        subheader={`+9/сек. • Цена: ${props.mine10} Кристаллов`}

      />
      <Banner
                       before={<Avatar size={40}> <Icon28BombOutline fill="000000" /> </Avatar> }
onClick={props.buyAuto11}
        header="Сверхскоростной майнер"
        subheader={`+15/сек. • Цена: ${props.mine11} Кристаллов`}

      />
   </Group>}
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
        {props.promoBannerProps && <FixedLayout vertical="bottom">

     </FixedLayout> }
  </Panel>
);

export default Shop;

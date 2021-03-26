import React from "react";


import { Panel, Button, Avatar, 
  PanelHeaderBack, Div, Title,
  PanelHeader, CardGrid, Card 
} from '@vkontakte/vkui';
import { Icon28ZipOutline, Icon28HistoryForwardOutline, Icon16Verified, 
  Icon28MoneyCircleOutline, Icon28MoneyTransferOutline 
} from '@vkontakte/icons';


const Dop = props => (
	<Panel id={props.id} theme="white" separator={false} header={false}>
	<PanelHeader left={<PanelHeaderBack onClick={window.history.back()} />}>  
Информация о пользователе
  </PanelHeader> 
  <br />
  <center>

                <div>
                    <Avatar
                        size={128}
                        shadow={false}
                        src={props.this.state.userInfo.photo}
                        onClick={() => window.location.href=`https://vk.com/id${props.this.state.userInfo.id}`}
                    />

                    <h1 style={{ color: '#73fffe' }}>{props.this.state.userInfo.name}</h1>
                    {props.this.state.userInfo.verify ? <p style={{ marginTop: -10 }}>{<Icon16Verified />}</p> : null}
                </div>

            </center>
            <CardGrid>
              <Card size="l" style={{ background: '#092047' }}>
              <div style={{ height: 10 }} />

              <Div>
                <center><Title level="1" weight="bold" style={{ marginBottom: 16, color: '#73fffe' }}>{<Icon28MoneyCircleOutline />} {<br />} Баланс: {number_format(parseFloat(props.this.state.userInfo.balance).toFixed(3))} FCOINS</Title></center>
              </Div>
              <Div>
                <center><Title level="1" weight="bold" style={{ marginBottom: 16, color: '#73fffe' }}>{<Icon28HistoryForwardOutline />} {<br />} Автоматический фарм: {number_format(parseFloat(props.this.state.userInfo.mine).toFixed(3))} FCOINS</Title></center>
              </Div>
              <Div>
                <center><Title level="1" weight="bold" style={{ marginBottom: 16, color: '#73fffe' }}>{<Icon28ZipOutline />} {<br />} Плата за клик: {number_format(parseFloat(props.this.state.userInfo.click).toFixed(3))} FCOINS</Title></center>
              </Div>
              <Div>
                <center><Button size="l" before={<Icon28MoneyTransferOutline />} onClick={props.this.usTransfer}>Перевести FCOINS</Button></center>
              </Div>
              <div style={{ height: 10 }} />
              </Card>
            </CardGrid>
            <br />
	</Panel>
);

function number_format( number, decimals, dec_point, thousands_sep ) {

	var i, j, kw, kd, km;

	// input sanitation & defaults
	if( isNaN(decimals = Math.abs(decimals)) ){
		decimals = 2;
	}
	if( dec_point === undefined ){
		dec_point = ".";
	}
	if( thousands_sep === undefined ){
		thousands_sep = " ";
	}

	i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

	if( (j = i.length) > 3 ){
		j = j % 3;
	} else{
		j = 0;
	}

	km = (j ? i.substr(0, j) + thousands_sep : "");
	kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
	//kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).slice(2) : "");
	kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");


	return km + kw + kd;
}

export default Dop;
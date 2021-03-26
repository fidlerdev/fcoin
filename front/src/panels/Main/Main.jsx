import React from 'react';
import { motion } from "framer-motion";


import { Panel, PanelHeaderContent, Div, 
  Avatar, PanelHeader, Footer
} from '@vkontakte/vkui';
import { Icon28Users3Outline, Icon28SafariOutline,
  Icon28MarketAddBadgeOutline
} from '@vkontakte/icons';


import '../assets/css/bootstrap.css';
import '../assets/css/style.css';
import '@vkontakte/vkui/dist/vkui.css';


function number_format( number, decimals, dec_point, thousands_sep ) {

	var i, j, kw, kd, km;

	// input sanitation & defaults
	if( isNaN(decimals = Math.abs(decimals)) ){
		decimals = 2;
	}
	if( dec_point === undefined ){
		dec_point = ",";
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


const Main = props => (
	<Panel id={props.id} separator={false}>
  <PanelHeader><PanelHeaderContent before={<Avatar src={props.fetchedUser.photo_200} size={36} onClick={props.modal} data-to="profile" />}>
                FCOIN
              </PanelHeaderContent></PanelHeader>
      <motion.div
style={{opacity: 0}}
  animate={{ opacity: 1 }}
  transition={{ ease: "easeOut", duration: 1 }}
> 

                        <div class='inn'>
                          {/*<Div>
                        <div className='ProfileTab__user-data-timer'>{props.this.state.fulltime}</div>
                        </Div> */}
                        <br /> 
                        <br /> 

                          <Div className='balance'>

                            <p>Ваш счёт</p>
                            <h1>
                               {number_format(parseFloat(props.balance), 4)} 
                            </h1>
                             <p>
                             +{number_format(parseFloat(props.clicksec), 4)}/клик &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  +{number_format(parseFloat(props.mine), 4)}/сек
                            </p> 
                        </Div>
                                           <center> 
                            <div onClick={props.go} data-to="top" className='da_div'>
                                <div id='da_div_transfer'
                                     className='da_divContent'>
                                    <div className='da_content'><Icon28Users3Outline fill="#fff" /></div>
                                </div>
                                <div onClick={props.go} data-to="top" style={{ color: '#fff' }} className='da_contentText'>ТОП</div>
                            </div>
                            <div onClick={props.go} data-to="shop" className='da_div'>
                                <div id='da_div_rating'
                                     className='da_divContent'>
                                    <div className='da_content'><Icon28MarketAddBadgeOutline fill="#fff" /></div>
                                </div>
                                <div onClick={props.go} data-to="shop" style={{ color: '#fff' }} className='da_contentText'>МАГАЗИН</div>
                            </div>
                            
                            <div onClick={props.go} data-to="dop" className='da_div'>
                                <div id='da_div_get'
                                     className='da_divContent'>
                                    <div className='da_content'><Icon28SafariOutline fill="#fff" /></div>
                                </div>
                                <div onClick={props.go} data-to="dop" style={{ color: '#fff' }} className='da_contentText'>ДРУГОЕ</div>
                            </div>                   
                             </center>
	 </div> 
   
           



   <Div align="center" style={{ height: "315px"}}>
       	<img src={require('../assets/css/click.png')} class="ass" onClick={props.click} width={300} height={300} />
    </Div>

    <Footer>Онлайн: {props.online}</Footer>

</motion.div>
	</Panel>
);

export default Main;
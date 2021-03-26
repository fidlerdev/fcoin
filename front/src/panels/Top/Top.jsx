import React from 'react';
import connect from '@vkontakte/vk-bridge';


import { Icon56GalleryOutline, Icon12OnlineMobile } from '@vkontakte/icons';
import { Panel, Button, Tabs, 
  Separator, Spinner, TabsItem, 
  FixedLayout, HorizontalScroll, Div, 
  Avatar, PanelHeader, PanelHeaderBack, 
  List, Cell 
} from '@vkontakte/vkui';


const gradient = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
const avatarWrapperStyle = {
      display: "flex",
      flexDirection: "row",
      paddingRight: 10
    };

   const utils = {
    sp: (int) => {
        int = int.toString();
        return int.split('').reverse().join('').match(/[0-9]{1,3}/g).join(',').split('').reverse().join('');
    },

    rn: (int, fixed) => {
        if (int === null) return null;
        if (int === 0) return '0';
        fixed = (!fixed || fixed < 0) ? 0 : fixed;
        let b = (int).toPrecision(2).split('e'),
            k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3),
            c = k < 1 ? int.toFixed(0 + fixed) : (int / Math.pow(10, k * 3)).toFixed(1 + fixed),
            d = c < 0 ? c : Math.abs(c),
            e = d + ['', 'тыс', 'млн', 'млрд', 'трлн'][k];

        e = e.replace(/e/g, '');
        e = e.replace(/\+/g, '');
        e = e.replace(/Infinity/g, 'ДОХЕРА');

        return e;
    },

    gi: (int) => {
        int = int.toString();

        let text = ``;
        for (let i = 0; i < int.length; i++) {
            text += `${int[i]}⃣`;
        }

        return text;
    },
    decl: (n, titles) => {
        return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2]
    },
    random: (x, y) => {
        return y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x);
    },
    pick: (array) => {
        return array[utils.random(array.length - 1)];
    }
}

    const avatarIconWrapper = {
      background: "var(--background_content)",
      border: "2px solid var(--background_content)",
      borderRadius: 4,
      marginLeft: 38,
      marginTop: 32
    };
function Blog(props) {

  const content = Object.keys(props.posts).map((post) =>
    <div key={post.user_id}>

    {post < 100 ? <Cell className='ratingMyCell' before={<table className='table'>
                <tr>
                    <td>
                        <div className='ratingPosition'>{Number(post) + 1}</div>
                    </td>
                    <td style={{position: 'relative'}}>{props.posts[post].online ? <Avatar  shadow={false} size={48} src={props.posts[post].photo}>
                    <div style={avatarIconWrapper}>
                      <Icon12OnlineMobile fill="green" />
                    </div>
                  </Avatar> : <Avatar shadow={false} size={48} src={props.posts[post].photo} />}

                    </td>
                </tr>
            </table>}
                          description={`${parseFloat(props.posts[post].balance).toFixed(3)} FCOINS`}
                          expandable
                          onClick={props.getUserInfo} data-to={props.posts[post].id}>{props.posts[post].name}
</Cell>
 :null}
    </div>
  );

  return (
    <div>

      {content}
    </div>
  );
}
function Ref(props) {

  const content = Object.keys(props.posts).map((post) =>
    <div key={post.user_id}>

    {post < 100 ? <Cell className='ratingMyCell' before={<table className='table'>
                <tr>
                    <td>
                        <div className='ratingPosition'>{Number(post) + 1}</div>
                    </td>
                    <td style={{position: 'relative'}}>{props.posts[post].online ? <Avatar  shadow={false} size={48} src={props.posts[post].photo}>
                    <div style={avatarIconWrapper}>
                      <Icon12OnlineMobile fill="green" />
                    </div>
                  </Avatar> : <Avatar shadow={false} size={48} src={props.posts[post].photo} />}

                    </td>
                </tr>
            </table>}
                           description={`Пригласил ${parseFloat(props.posts[post].balance).toFixed(0)} человек`}
                           expandable
                          onClick={props.getUserInfo} data-to={props.posts[post].id}>{props.posts[post].name}
</Cell>
 :null}
    </div>
  );

  return (
    <div>

      {content}
    </div>
  );
}
function Gold(props) {

  const content = Object.keys(props.posts).map((post) =>
    <div key={post.user_id}>

    {post < 100 ? <Cell className='ratingMyCell' before={<table className='table'>
                <tr>
                    <td>
                        <div className='ratingPosition'>{Number(post) + 1}</div>
                    </td>
                    <td style={{position: 'relative'}}>{props.posts[post].online ? <Avatar  shadow={false} size={48} src={props.posts[post].photo}>
                    <div style={avatarIconWrapper}>
                      <Icon12OnlineMobile fill="green" />
                    </div>
                  </Avatar> : <Avatar shadow={false} size={48} src={props.posts[post].photo} />}

                    </td>
                </tr>
            </table>}
                           description={`${parseFloat(props.posts[post].balance).toFixed(3)} кристаллов`}
                           expandable
                          onClick={props.getUserInfo} data-to={props.posts[post].id}>{props.posts[post].name}
</Cell>
 :null}
    </div>
  );

  return (
    <div>

      {content}
    </div>
  );
}
function Clan(props) {

  const content = Object.keys(props.posts).map((post) =>
    <div key={post.user_id}>

    {post < 100 ? <Cell className='ratingMyCell' before={<table className='table'>
                <tr>
                    <td>
                        <div className='ratingPosition'>{Number(post) + 1}</div>
                    </td>
                    <td style={{position: 'relative'}}>{props.posts[post].photo === null ? <Avatar size={48}><Icon56GalleryOutline height={28}/></Avatar>  : <Avatar shadow={false} size={48} src={props.posts[post].photo} />}
                    </td>
                </tr>
            </table>}
                           description={`${props.posts[post].win} побед`}
                           expandable onClick={() => {
                             window.socket.emit('getClanById', {

          "id": props.posts[post].id,
          "params": window.location.search.substring()
        })
                           }}
                         >{props.posts[post].name}
</Cell>
 :null}
    </div>
  );

  return (
    <div>

      {content}
    </div>
  );
}

function Blog1(props) {

    const content = Object.keys(props.posts).map((post) =>
    <div key={post.user_id}>

    {post < 100 ? <Cell className='ratingMyCell' before={<table className='table'>
                <tr>
                    <td>
                        <div className='ratingPosition'>{Number(post) + 1}</div>
                    </td>
                    <td style={{position: 'relative'}}><Avatar shadow={false} size={48} src={props.posts[post].photo} />
                    </td>
                </tr>
            </table>}
                           description={`${parseFloat(props.posts[post].balance).toFixed(3)} FCOINS`}
                           expandable
                          onClick={props.getUserInfo} data-to={props.posts[post].id}>{props.posts[post].name}
</Cell> : null}
    </div>
    );

  return (
    <div>

      {content}
    </div>
  );
}

function Blog2(props) {

  const content = Object.keys(props.posts).map((post) =>
    <div key={post.user_id}>

     {post < 100 ? <Cell className='ratingMyCell' before={<table className='table'>
                <tr>
                    <td>
                        <div className='ratingPosition'>{Number(post) + 1}</div>
                    </td>
                    <td style={{position: 'relative'}}><Avatar shadow={false} size={48} src={props.posts[post].photo} />
                    </td>
                </tr>
            </table>}
                           description={`${parseFloat(props.posts[post].balance).toFixed(3)} FCOINS`}
                           expandable
                           onClick={() => window.location.href=`https://vk.com/public${props.posts[post].id}`}>{props.posts[post].name}</Cell> : null}
       <FixedLayout vertical="bottom">
         <Div>
       <Button size="xl" mode="commerce" onClick={() => connect.send("VKWebAppAddToCommunity", {})}>Добавить в группу</Button>
     </Div>
        </FixedLayout>
    </div>
  );

  return (
    <div>

      {content}
    </div>
  );
}

const Top = props => (
  <Panel id={props.id} >
    <PanelHeader left={<PanelHeaderBack onClick={() => window.history.back()} />}>Топ</PanelHeader>
    <Tabs>
    <HorizontalScroll>
              <TabsItem
                selected={props.tab === 'balance'}
                onClick={props.set}
                data-to='balance'
              >
               Баланс
              </TabsItem>

              <TabsItem
                selected={props.tab === 'speed'}
                onClick={props.set}
                data-to='speed'
              >
                Скорость
              </TabsItem>

              <TabsItem
                selected={props.tab === 'groups'}
                onClick={props.set}
                data-to='groups'
              >
                Группы
              </TabsItem>
              </HorizontalScroll>
            </Tabs>

                          <Separator />

             <List>
  
              </List>
              <Separator />

    {props.tab === 'balance' && <div>
    {props.this.state.isTopLoad ? <div><br /><Spinner
          size='large'
        /> </div>: <Blog posts={props.top} getUserInfo={props.this.getUserInfo} pos={props.pos} /> }
        </div>}
    {props.tab === 'speed' && <div>

    {props.this.state.isTopLoad ? <div><br /><Spinner
          size='large'
        /> </div> : <Blog1 posts={props.speedtop} getUserInfo={props.this.getUserInfo} pos={props.pos} /> }

        </div>}
        {props.tab === 'clans' && <div>

    {props.this.state.isTopLoad ? <div><br /><Spinner
          size='large'
        /> </div> : <Clan posts={props.this.state.clanTop} getUserInfo={props.this.getUserInfo} pos={props.pos} /> }

        </div>}
         {props.tab === 'ref' && <div>

    {props.this.state.isTopLoad ? <div><br /><Spinner
          size='large'
        /> </div> : <Ref posts={props.this.state.refTop} getUserInfo={props.this.getUserInfo} pos={props.pos} /> }

        </div>}
         {props.tab === 'gold' && <div>

    {props.this.state.isTopLoad ? <div><br /><Spinner
          size='large'
        /> </div> : <Gold posts={props.this.state.goldTop} getUserInfo={props.this.getUserInfo} pos={props.pos} /> }

        </div>}
        {props.tab === 'groups' && <div>

    {props.this.state.isTopLoad ? <div><br /><Spinner
          size='large'
        /> </div> : <Blog2 posts={props.groups} pos={props.pos} /> }

        </div>}

    </Panel>
);

export default Top;

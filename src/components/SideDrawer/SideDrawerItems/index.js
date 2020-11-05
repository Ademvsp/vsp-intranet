import React from 'react';
import List from '@material-ui/core/List';
import { StyledListContainer } from './styled-components';
import DashboardIcon from '@material-ui/icons/Dashboard';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import EventIcon from '@material-ui/icons/Event';
import SchoolIcon from '@material-ui/icons/School';
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
// import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
// import MoneyIcon from '@material-ui/icons/Money';
// import DescriptionIcon from '@material-ui/icons/Description';
import DialpadIcon from '@material-ui/icons/Dialpad';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import LanguageIcon from '@material-ui/icons/Language';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import ReceiptIcon from '@material-ui/icons/Receipt';
// import PermMediaIcon from '@material-ui/icons/PermMedia';
import DateRangeIcon from '@material-ui/icons/DateRange';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import SideDrawerItem from './SideDrawerItem';
import BuildIcon from '@material-ui/icons/Build';
import GetAppIcon from '@material-ui/icons/GetApp';

const SideDrawerItems = (props) => {
  return (
    <StyledListContainer disableGutters>
      <List>
        <SideDrawerItem
          Icon={DashboardIcon}
          text='Dashboard'
          link='/dashboard'
        />
        <SideDrawerItem Icon={RssFeedIcon} text='News Feed' link='/newsfeed' />
        <SideDrawerItem
          Icon={DateRangeIcon}
          text='Calendar'
          subItems={[
            <SideDrawerItem
              key='0'
              Icon={EventIcon}
              text='Staff Calendar'
              link='/calendar'
              subItem={true}
            />,
            <SideDrawerItem
              key='1'
              Icon={SchoolIcon}
              text='Training Schedule'
              link='/calendar'
              subItem={true}
            />
          ]}
        />
        <SideDrawerItem
          Icon={ContactPhoneIcon}
          text='Staff Directory'
          link='/directory'
        />
        <SideDrawerItem
          Icon={AttachMoneyIcon}
          text='Projects'
          link='/projects'
        />
        <SideDrawerItem
          Icon={PlaylistAddCheckIcon}
          text='Job Documents'
          link='/job-documents'
        />
        <SideDrawerItem
          Icon={GetAppIcon}
          text='Firmware & Software'
          link='/firmware'
        />
        <SideDrawerItem
          Icon={BuildIcon}
          text='Sales Tools'
          subItems={[
            <SideDrawerItem
              key='0'
              Icon={EventIcon}
              text='Staff Calendar'
              link='/calendar'
              subItem={true}
            />,
            <SideDrawerItem
              key='1'
              Icon={SchoolIcon}
              text='Training Schedule'
              link='/calendar'
              subItem={true}
            />
          ]}
        />
        <SideDrawerItem
          Icon={DialpadIcon}
          text='Sales Tools'
          link='/calculators'
        />
        <SideDrawerItem
          Icon={LocalOfferIcon}
          text='Promotions'
          link='/promotions'
        />
        <SideDrawerItem
          Icon={LanguageIcon}
          text='Resources'
          link='/resources'
        />
        <SideDrawerItem
          Icon={ListAltIcon}
          text='Forms'
          subItems={[
            <SideDrawerItem
              key='0'
              Icon={ShoppingCartIcon}
              text='Product Request'
              link='/product-requests'
              subItem={true}
            />,
            <SideDrawerItem
              key='1'
              Icon={DirectionsWalkIcon}
              text='Leave Request'
              link='/leave-requests'
              subItem={true}
            />,
            <SideDrawerItem
              key='2'
              Icon={ReceiptIcon}
              text='Expenses Claim'
              link='/expense-claims'
              subItem={true}
            />
          ]}
        />
      </List>
    </StyledListContainer>
  );
};

export default SideDrawerItems;

import React from 'react';
import List from '@material-ui/core/List';
import { StyledListContainer } from './styled-components';
import DashboardIcon from '@material-ui/icons/Dashboard';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import EventIcon from '@material-ui/icons/Event';
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import LanguageIcon from '@material-ui/icons/Language';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import ReceiptIcon from '@material-ui/icons/Receipt';
import DataUsageIcon from '@material-ui/icons/DataUsage';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import SideDrawerItem from './SideDrawerItem';
import BuildIcon from '@material-ui/icons/Build';
import GetAppIcon from '@material-ui/icons/GetApp';
import TimelineIcon from '@material-ui/icons/Timeline';
import StorageIcon from '@material-ui/icons/Storage';
import TransferWithinAStationIcon from '@material-ui/icons/TransferWithinAStation';
import SlowMotionVideoIcon from '@material-ui/icons/SlowMotionVideo';

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
          Icon={EventIcon}
          text='Staff Calendar'
          link='/calendar'
        />
        <SideDrawerItem
          Icon={ContactPhoneIcon}
          text='Staff Directory'
          link='/directory'
        />
        <SideDrawerItem Icon={TimelineIcon} text='Projects' link='/projects' />
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
              Icon={AttachMoneyIcon}
              text='Pricing Calculator'
              link='/pricing-calculator'
              subItem={true}
            />,
            <SideDrawerItem
              key='1'
              Icon={StorageIcon}
              text='Storage Calculator'
              link='/storage-calculator'
              subItem={true}
            />,
            <SideDrawerItem
              key='2'
              Icon={SlowMotionVideoIcon}
              text='Motion Calculator'
              link='/motion-calculator'
              subItem={true}
            />,
            <SideDrawerItem
              key='3'
              Icon={DataUsageIcon}
              text='RAID Calculator'
              link='/raid-calculator'
              subItem={true}
            />
          ]}
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
              Icon={TransferWithinAStationIcon}
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

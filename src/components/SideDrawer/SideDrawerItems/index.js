import React from 'react';
import List from '@material-ui/core/List';
import { StyledListContainer } from './styled-components';
import {
	Dashboard as DashboardIcon,
	RssFeed as RssFeedIcon,
	Event as EventIcon,
	School as SchoolIcon,
	ContactPhone as ContactPhoneIcon,
	AttachMoney as AttachMoneyIcon,
	CloudDownload as CloudDownloadIcon,
	Money as MoneyIcon,
	Description as DescriptionIcon,
	Dialpad as DialpadIcon,
	LocalOffer as LocalOfficeIcon,
	Language as LanguageIcon,
	ListAlt as ListAltIcon,
	ShoppingCart as ShoppingCartIcon,
	DirectionsWalk as DirectionsWalkIcon,
	Receipt as ReceiptIcon,
	PermMedia as PermMediaIcon,
	DateRange as DateRangeIcon
} from '@material-ui/icons';
import SideDrawerItem from './SideDrawerItem';

const SideDrawerItems = (props) => {
	return (
		<StyledListContainer>
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
					Icon={CloudDownloadIcon}
					text='Fileshare'
					subItems={[
						<SideDrawerItem
							key='0'
							Icon={PermMediaIcon}
							text='File Explorer'
							link='/calendar'
							subItem={true}
						/>,
						<SideDrawerItem
							key='1'
							Icon={MoneyIcon}
							text='Pricelists'
							link='/calendar'
							subItem={true}
						/>,
						<SideDrawerItem
							key='2'
							Icon={DescriptionIcon}
							text='Technical Documents'
							link='/calendar'
							subItem={true}
						/>
					]}
				/>
				<SideDrawerItem Icon={DialpadIcon} text='Calculators' link='/' />
				<SideDrawerItem Icon={LocalOfficeIcon} text='Promotions' link='/' />
				<SideDrawerItem Icon={LanguageIcon} text='Links' link='/' />
				<SideDrawerItem
					Icon={ListAltIcon}
					text='Forms'
					subItems={[
						<SideDrawerItem
							key='0'
							Icon={ShoppingCartIcon}
							text='Product Request'
							link='/calendar'
							subItem={true}
						/>,
						<SideDrawerItem
							key='1'
							Icon={DirectionsWalkIcon}
							text='Leave Request'
							link='/calendar'
							subItem={true}
						/>,
						<SideDrawerItem
							key='2'
							Icon={ReceiptIcon}
							text='Expenses Claim'
							link='/calendar'
							subItem={true}
						/>
					]}
				/>
			</List>
		</StyledListContainer>
	);
};

export default SideDrawerItems;

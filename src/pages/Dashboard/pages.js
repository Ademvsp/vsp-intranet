/* eslint-disable quotes */

import {
	RssFeed as RssFeedIcon,
	Event as EventIcon,
	School as SchoolIcon,
	ContactPhone as ContactPhoneIcon,
	AttachMoney as AttachMoneyIcon,
	Dialpad as DialpadIcon,
	LocalOffer as LocalOfficeIcon,
	Language as LanguageIcon,
	ShoppingCart as ShoppingCartIcon,
	DirectionsWalk as DirectionsWalkIcon,
	Receipt as ReceiptIcon,
	AccountCircle as AccountCircleIcon
} from '@material-ui/icons';

const pages = [
	{
		name: 'News Feed',
		description:
			'Get all the latest news and updates about the company and its operations',
		icon: RssFeedIcon,
		link: '/newsfeed'
	},
	{
		name: 'Staff Calendar',
		description: "See all staff member's movements and schedule events",
		icon: EventIcon,
		link: '/calendar'
	},
	{
		name: 'Training Schedule',
		description: 'See all upcoming training sessions from our vendors',
		icon: SchoolIcon,
		link: '/training'
	},
	{
		name: 'Staff Directory',
		description: "Look up staff member's contact details",
		icon: ContactPhoneIcon,
		link: '/directory'
	},
	{
		name: 'Projects',
		description: 'Register and manage your project opportunities',
		icon: AttachMoneyIcon,
		link: '/projects'
	},
	{
		name: 'Calculators',
		description:
			'Use the pre-sales calculators to calculate storage, bandwidth, resources etc.',
		icon: DialpadIcon,
		link: '/calculators'
	},
	{
		name: 'Promotions',
		description: 'See all the upcoming company promotions and when they expire',
		icon: LocalOfficeIcon,
		link: '/promotions'
	},
	{
		name: 'Links',
		description: 'Discover all the useful links to various online resources',
		icon: LanguageIcon,
		link: '/links'
	},
	{
		name: 'Product Request Form',
		description:
			'Use this form to add request a new part number to be added into Fishbowl',
		icon: ShoppingCartIcon,
		link: '/product-requests'
	},
	{
		name: 'Leave Request Form',
		description:
			'Apply for annual leave, sick leave or any other type of leave here',
		icon: DirectionsWalkIcon,
		link: '/leave-requests'
	},
	{
		name: 'Expenses',
		description: 'Claim your company expenses here',
		icon: ReceiptIcon,
		link: '/expenses'
	},
	{
		name: 'Account',
		description: 'Update your account settings and preferences',
		icon: AccountCircleIcon,
		link: '/account'
	}
];

export default pages;

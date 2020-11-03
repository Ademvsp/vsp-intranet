/* eslint-disable quotes */

// import DashboardIcon from '@material-ui/icons/Dashboard';
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
// import ListAltIcon from '@material-ui/icons/ListAlt';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import ReceiptIcon from '@material-ui/icons/Receipt';
// import PermMediaIcon from '@material-ui/icons/PermMedia';
// import DateRangeIcon from '@material-ui/icons/DateRange';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import BuildIcon from '@material-ui/icons/Build';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

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
    icon: LocalOfferIcon,
    link: '/promotions'
  },
  {
    name: 'Job Documents',
    description: 'Download and upload documents on completion of jobs',
    icon: PlaylistAddCheckIcon,
    link: '/job-documents'
  },
  {
    name: 'Firmware & Software',
    description: 'Download the latest product firmware and software',
    icon: BuildIcon,
    link: '/firmware'
  },
  {
    name: 'Resources',
    description: 'Discover all the useful links to various online resources',
    icon: LanguageIcon,
    link: '/resrouces'
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
    link: '/expense-claims'
  },
  {
    name: 'Account',
    description: 'Update your account settings and preferences',
    icon: AccountCircleIcon,
    link: '/account'
  }
];

export default pages;

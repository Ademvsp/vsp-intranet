const raidTypes = [
  {
    name: 'JBOD',
    description: 'No Redundancy, 100% Performance',
    penalty: 0
  },
  {
    name: 'RIAD0',
    description: 'No Redundancy, 100% Performance',
    penalty: 0
  },
  {
    name: 'RAID1',
    description: 'Mirrored Drives, 1/2 Performance',
    penalty: -1
  },
  {
    name: 'RAID10',
    description: 'Mirrored Drives, 1/2 Performance',
    penalty: -1
  },
  {
    name: 'RAID5',
    description: '1 Harddrive Fault Rolerance, 1/4 Performance',
    penalty: 1
  },
  {
    name: 'RAID6',
    description: '2 Harddrive Fault Rolerance, 1/5 Performance.',
    penalty: 2
  }
];

export default raidTypes;

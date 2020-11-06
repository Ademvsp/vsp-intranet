import {
  CardContent,
  Grid,
  TableBody,
  TableCell,
  TableRow
} from '@material-ui/core';
import { toPercentage } from '../../utils/data-transformer';
import React from 'react';

export const hours = [
  '00:00-03:00',
  '03:00-06:00',
  '06:00-09:00',
  '09:00-12:00',
  '12:00-15:00',
  '15:00-18:00',
  '18:00-21:00',
  '21:00-24:00'
];

export const columnSchema = [
  {
    field: 'day',
    title: 'Day',
    type: 'string',
    align: 'center'
  },
  {
    field: 'values[0]',
    title: hours[0],
    type: 'numeric',
    render: (rowData) => toPercentage(rowData.values[0]),
    align: 'center'
  },
  {
    field: 'values[1]',
    title: hours[1],
    type: 'numeric',
    render: (rowData) => toPercentage(rowData.values[1]),
    align: 'center'
  },
  {
    field: 'values[2]',
    title: hours[2],
    type: 'numeric',
    render: (rowData) => toPercentage(rowData.values[2]),
    align: 'center'
  },
  {
    field: 'values[3]',
    title: hours[3],
    type: 'numeric',
    render: (rowData) => toPercentage(rowData.values[3]),
    align: 'center'
  },
  {
    field: 'values[4]',
    title: hours[4],
    type: 'numeric',
    render: (rowData) => toPercentage(rowData.values[4]),
    align: 'center'
  },
  {
    field: 'values[5]',
    title: hours[5],
    type: 'numeric',
    render: (rowData) => toPercentage(rowData.values[5]),
    align: 'center'
  },
  {
    field: 'values[6]',
    title: hours[6],
    type: 'numeric',
    render: (rowData) => toPercentage(rowData.values[6]),
    align: 'center'
  },
  {
    field: 'values[7]',
    title: hours[7],
    type: 'numeric',
    render: (rowData) => toPercentage(rowData.values[7]),
    align: 'center'
  }
];

export const detailPanelHandler = (rowData) => {
  const motionAverage =
    rowData.values.reduce(
      (previousValue, currentValue) => previousValue + currentValue
    ) / rowData.values.length;
  const minMotion = Math.min(...rowData.values);
  const maxMotion = Math.max(...rowData.values);

  const motionPercentage = toPercentage(motionAverage, 2);
  const minMotionPercentage = toPercentage(minMotion, 2);
  const maxMotionPercentage = toPercentage(maxMotion, 2);
  return (
    <CardContent>
      <Grid container direction='column' alignItems='flex-end'>
        <TableBody>
          <TableRow>
            <TableCell align='right'>Minimum</TableCell>
            <TableCell align='right'>{minMotionPercentage}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>Maximum</TableCell>
            <TableCell align='right'>{maxMotionPercentage}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align='right'>Average</TableCell>
            <TableCell align='right'>{motionPercentage}</TableCell>
          </TableRow>
        </TableBody>
      </Grid>
    </CardContent>
  );
};

export const initialValues = [
  {
    day: 'Monday',
    values: [50, 50, 50, 50, 50, 50, 50, 50]
  },
  {
    day: 'Tuesday',
    values: [50, 50, 50, 50, 50, 50, 50, 50]
  },
  {
    day: 'Wednesday',
    values: [50, 50, 50, 50, 50, 50, 50, 50]
  },
  {
    day: 'Thursday',
    values: [50, 50, 50, 50, 50, 50, 50, 50]
  },
  {
    day: 'Friday',
    values: [50, 50, 50, 50, 50, 50, 50, 50]
  },
  {
    day: 'Saturday',
    values: [50, 50, 50, 50, 50, 50, 50, 50]
  },
  {
    day: 'Sunday',
    values: [50, 50, 50, 50, 50, 50, 50, 50]
  }
];

export const presets = [
  {
    name: 'School',
    days: [
      {
        day: 'Monday',
        values: [5, 5, 20, 65, 65, 40, 10, 5]
      },
      {
        day: 'Tuesday',
        values: [5, 5, 20, 65, 65, 40, 10, 5]
      },
      {
        day: 'Wednesday',
        values: [5, 5, 20, 65, 65, 40, 10, 5]
      },
      {
        day: 'Thursday',
        values: [5, 5, 20, 65, 65, 40, 10, 5]
      },
      {
        day: 'Friday',
        values: [5, 5, 20, 65, 65, 40, 10, 5]
      },
      {
        day: 'Saturday',
        values: [5, 5, 5, 5, 5, 5, 5, 5]
      },
      {
        day: 'Sunday',
        values: [5, 5, 5, 5, 5, 5, 5, 5]
      }
    ]
  },
  {
    name: 'Office',
    days: [
      {
        day: 'Monday',
        values: [5, 5, 15, 5, 5, 5, 10, 5]
      },
      {
        day: 'Tuesday',
        values: [5, 5, 15, 5, 5, 5, 10, 5]
      },
      {
        day: 'Wednesday',
        values: [5, 5, 15, 5, 5, 5, 10, 5]
      },
      {
        day: 'Thursday',
        values: [5, 5, 15, 5, 5, 5, 10, 5]
      },
      {
        day: 'Friday',
        values: [5, 5, 15, 5, 5, 5, 10, 5]
      },
      {
        day: 'Saturday',
        values: [5, 5, 5, 5, 5, 5, 5, 5]
      },
      {
        day: 'Sunday',
        values: [5, 5, 5, 5, 5, 5, 5, 5]
      }
    ]
  },
  {
    name: 'Hospital',
    days: [
      {
        day: 'Monday',
        values: [40, 40, 65, 95, 95, 95, 64, 40]
      },
      {
        day: 'Tuesday',
        values: [40, 40, 65, 95, 95, 95, 64, 40]
      },
      {
        day: 'Wednesday',
        values: [40, 40, 65, 95, 95, 95, 64, 40]
      },
      {
        day: 'Thursday',
        values: [40, 40, 65, 95, 95, 95, 64, 40]
      },
      {
        day: 'Friday',
        values: [40, 40, 65, 95, 95, 95, 64, 40]
      },
      {
        day: 'Saturday',
        values: [40, 40, 65, 95, 95, 95, 64, 40]
      },
      {
        day: 'Sunday',
        values: [40, 40, 65, 95, 95, 95, 64, 40]
      }
    ]
  },
  {
    name: 'City Streets',
    days: [
      {
        day: 'Monday',
        values: [20, 20, 50, 80, 80, 80, 50, 20]
      },
      {
        day: 'Tuesday',
        values: [20, 20, 50, 80, 80, 80, 50, 20]
      },
      {
        day: 'Wednesday',
        values: [20, 20, 50, 80, 80, 80, 50, 20]
      },
      {
        day: 'Thursday',
        values: [20, 20, 50, 80, 80, 80, 50, 20]
      },
      {
        day: 'Friday',
        values: [20, 20, 50, 80, 80, 80, 50, 20]
      },
      {
        day: 'Saturday',
        values: [20, 20, 50, 80, 80, 80, 50, 20]
      },
      {
        day: 'Sunday',
        values: [20, 20, 50, 80, 80, 80, 50, 20]
      }
    ]
  },
  {
    name: 'Shopping Mall',
    days: [
      {
        day: 'Monday',
        values: [10, 20, 50, 95, 95, 65, 50, 10]
      },
      {
        day: 'Tuesday',
        values: [10, 20, 50, 95, 95, 65, 50, 10]
      },
      {
        day: 'Wednesday',
        values: [10, 20, 50, 95, 95, 65, 50, 10]
      },
      {
        day: 'Thursday',
        values: [10, 20, 50, 95, 95, 65, 50, 10]
      },
      {
        day: 'Friday',
        values: [10, 20, 50, 95, 95, 65, 50, 10]
      },
      {
        day: 'Saturday',
        values: [10, 20, 50, 95, 95, 65, 50, 10]
      },
      {
        day: 'Sunday',
        values: [10, 20, 50, 95, 95, 65, 50, 10]
      }
    ]
  },
  {
    name: 'Train Station',
    days: [
      {
        day: 'Monday',
        values: [20, 60, 90, 90, 90, 90, 50, 20]
      },
      {
        day: 'Tuesday',
        values: [20, 60, 90, 90, 90, 90, 50, 20]
      },
      {
        day: 'Wednesday',
        values: [20, 60, 90, 90, 90, 90, 50, 20]
      },
      {
        day: 'Thursday',
        values: [20, 60, 90, 90, 90, 90, 50, 20]
      },
      {
        day: 'Friday',
        values: [20, 60, 90, 90, 90, 90, 50, 20]
      },
      {
        day: 'Saturday',
        values: [20, 60, 60, 75, 75, 75, 50, 20]
      },
      {
        day: 'Sunday',
        values: [20, 60, 60, 75, 75, 75, 50, 20]
      }
    ]
  },
  {
    name: 'Residential',
    days: [
      {
        day: 'Monday',
        values: [5, 5, 35, 35, 35, 20, 10, 5]
      },
      {
        day: 'Tuesday',
        values: [5, 5, 35, 35, 35, 20, 10, 5]
      },
      {
        day: 'Wednesday',
        values: [5, 5, 35, 35, 35, 20, 10, 5]
      },
      {
        day: 'Thursday',
        values: [5, 5, 35, 35, 35, 20, 10, 5]
      },
      {
        day: 'Friday',
        values: [5, 5, 35, 35, 35, 20, 10, 5]
      },
      {
        day: 'Saturday',
        values: [5, 5, 35, 35, 35, 20, 10, 5]
      },
      {
        day: 'Sunday',
        values: [5, 5, 35, 35, 35, 20, 10, 5]
      }
    ]
  },
  {
    name: 'Airport',
    days: [
      {
        day: 'Monday',
        values: [30, 50, 100, 100, 100, 100, 50, 30]
      },
      {
        day: 'Tuesday',
        values: [30, 50, 100, 100, 100, 100, 50, 30]
      },
      {
        day: 'Wednesday',
        values: [30, 50, 100, 100, 100, 100, 50, 30]
      },
      {
        day: 'Thursday',
        values: [30, 50, 100, 100, 100, 100, 50, 30]
      },
      {
        day: 'Friday',
        values: [30, 50, 100, 100, 100, 100, 50, 30]
      },
      {
        day: 'Saturday',
        values: [30, 50, 100, 100, 100, 100, 50, 30]
      },
      {
        day: 'Sunday',
        values: [30, 50, 100, 100, 100, 100, 50, 30]
      }
    ]
  }
];

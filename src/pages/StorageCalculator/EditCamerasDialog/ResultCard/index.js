import {
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Typography
} from '@material-ui/core';
import React from 'react';
import { toDecimal } from '../../../../utils/data-transformer';

const ResultCard = (props) => {
  const { result } = props;
  return (
    <Paper variant='outlined'>
      <CardHeader title='Summary' style={{ paddingBottom: 0 }} />
      <CardContent>
        <Grid container direction='column' spacing={1}>
          <Grid item container justify='space-between'>
            <Typography>Frame Size</Typography>
            <Typography>{`${toDecimal(result.frameSize, 2)} kb`}</Typography>
          </Grid>
          <Grid item container justify='space-between'>
            <Typography>Bitrate (per camera)</Typography>
            <Typography>{`${toDecimal(result.bitrate, 2)} Mbps`}</Typography>
          </Grid>
          <Grid item container justify='space-between'>
            <Typography>Bitrate (total)</Typography>
            <Typography>{`${toDecimal(
              result.bitrateTotal,
              2
            )} Mbps`}</Typography>
          </Grid>
          <Grid item container justify='space-between'>
            <Typography>Storage (per camera)</Typography>
            <Typography>{`${toDecimal(result.storage, 2)} TB`}</Typography>
          </Grid>
          <Grid item container justify='space-between'>
            <Typography>Storage (total)</Typography>
            <Typography>{`${toDecimal(result.storageTotal, 2)} TB`}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Paper>
  );
};

export default ResultCard;

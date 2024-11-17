import PropTypes from 'prop-types';
import { Card, CardContent, Grid, Typography } from "@mui/material";

const DataCard = ({ icon, title, value }) => {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ maxWidth: 345, boxShadow: 3 }}>
        <CardContent>
          <Grid container alignItems="center" justifyContent="space-evenly" spacing={1}>
            <Grid item>
              <img src={icon} className="logo" alt={title} />
            </Grid>
            <Grid item>
              <Typography variant="h6" component="div">
                {title}
              </Typography>
              <Typography variant="h5" color="text.secondary">
                {value}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};

// Prop validation
DataCard.propTypes = {
  icon: PropTypes.string.isRequired,    // icon should be a string (URL or path)
  title: PropTypes.string.isRequired,   // title should be a string
  value: PropTypes.string.isRequired,   // value should be a string (you can adjust based on actual data type)
};

export default DataCard;

import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Grid,
  useTheme,
} from "@mui/material";
import { ModelTrainingJob } from "../../types/sharedModel";

interface Props {
  job: ModelTrainingJob;
}

const TrainingProgress: React.FC<Props> = ({ job }) => {
  const theme = useTheme();

  // Calculate progress based on metrics
  const calculateProgress = () => {
    if (!job.training_metrics.history) return 0;
    const currentEpoch = job.training_metrics.history.length;
    const totalEpochs = job.training_metrics.total_epochs || 100;
    return (currentEpoch / totalEpochs) * 100;
  };

  // Get the latest metrics
  const getLatestMetrics = () => {
    const history = job.training_metrics.history || [];
    return history[history.length - 1] || {};
  };

  const progress = calculateProgress();
  const latestMetrics = getLatestMetrics();

  const renderMetric = (label: string, value: number | undefined) => (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h6">
        {value !== undefined ? value.toFixed(4) : "N/A"}
      </Typography>
    </Box>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Training in Progress
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              backgroundColor: theme.palette.primary.main,
            },
          }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetric("Current Loss", latestMetrics.loss)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetric("Current Accuracy", latestMetrics.accuracy)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetric("Validation Loss", latestMetrics.val_loss)}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetric("Validation Accuracy", latestMetrics.val_accuracy)}
        </Grid>
      </Grid>

      {job.error_message && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: theme.palette.error.light,
            borderRadius: 1,
          }}
        >
          <Typography color="error" variant="body2">
            Error: {job.error_message}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TrainingProgress;

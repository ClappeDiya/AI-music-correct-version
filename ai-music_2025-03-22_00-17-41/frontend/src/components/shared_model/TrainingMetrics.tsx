import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  useTheme,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  metrics: Record<string, any>;
  detailed?: boolean;
}

const TrainingMetrics: React.FC<Props> = ({ metrics, detailed = false }) => {
  const theme = useTheme();

  const formatMetricValue = (value: number) => {
    if (value < 0.01) return value.toExponential(2);
    return value.toFixed(3);
  };

  const renderMetricCard = (label: string, value: number, color: string) => (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        backgroundColor: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h6" color={color}>
        {formatMetricValue(value)}
      </Typography>
    </Paper>
  );

  const renderLearningCurve = (data: any[], dataKey: string, color: string) => (
    <Box sx={{ height: 200, width: "100%" }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="epoch"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value + 1}`}
          />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={formatMetricValue} />
          <Tooltip
            formatter={(value: number) => [formatMetricValue(value), dataKey]}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );

  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
        No training metrics available
      </Typography>
    );
  }

  // Basic metrics view
  if (!detailed) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            "Loss",
            metrics.final_loss || 0,
            theme.palette.error.main,
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            "Accuracy",
            metrics.final_accuracy || 0,
            theme.palette.success.main,
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            "Validation Loss",
            metrics.final_val_loss || 0,
            theme.palette.warning.main,
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            "Validation Accuracy",
            metrics.final_val_accuracy || 0,
            theme.palette.info.main,
          )}
        </Grid>
      </Grid>
    );
  }

  // Detailed metrics view
  const historyData = metrics.history || [];
  const epochs = historyData.length;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              {renderMetricCard(
                "Final Loss",
                metrics.final_loss || 0,
                theme.palette.error.main,
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {renderMetricCard(
                "Final Accuracy",
                metrics.final_accuracy || 0,
                theme.palette.success.main,
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {renderMetricCard(
                "Best Loss",
                metrics.best_loss || 0,
                theme.palette.warning.main,
              )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {renderMetricCard(
                "Best Accuracy",
                metrics.best_accuracy || 0,
                theme.palette.info.main,
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Learning Curves */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Training Loss
          </Typography>
          {renderLearningCurve(historyData, "loss", theme.palette.error.main)}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Training Accuracy
          </Typography>
          {renderLearningCurve(
            historyData,
            "accuracy",
            theme.palette.success.main,
          )}
        </Grid>

        {/* Additional Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Training Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Epochs
                </Typography>
                <Typography variant="body1">{epochs}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Training Time
                </Typography>
                <Typography variant="body1">
                  {metrics.training_time
                    ? `${(metrics.training_time / 60).toFixed(1)} minutes`
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Learning Rate
                </Typography>
                <Typography variant="body1">
                  {metrics.learning_rate
                    ? metrics.learning_rate.toExponential(2)
                    : "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrainingMetrics;

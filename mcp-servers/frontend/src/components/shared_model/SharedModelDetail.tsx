import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  SharedModelGroup,
  ModelTrainingJob,
  TrainingContribution,
} from "../../types/sharedModel";
import { sharedModelService } from "../../services/sharedModelService";
import MemberList from "./MemberList";
import ContributionList from "./ContributionList";
import TrainingMetrics from "./TrainingMetrics";
import TrainingProgress from "./TrainingProgress";

interface Props {
  groupId: number;
}

const SharedModelDetail: React.FC<Props> = ({ groupId }) => {
  const [group, setGroup] = useState<SharedModelGroup | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    loadGroupDetails();
    setupWebSocket();

    return () => {
      websocket?.close();
    };
  }, [groupId]);

  const loadGroupDetails = async () => {
    try {
      const details = await sharedModelService.getGroupDetails(groupId);
      setGroup(details);
    } catch (error) {
      console.error("Failed to load group details:", error);
    }
  };

  const setupWebSocket = () => {
    const ws = sharedModelService.subscribeToUpdates(groupId, {
      onMemberUpdate: () => loadGroupDetails(),
      onContributionUpdate: () => loadGroupDetails(),
      onTrainingUpdate: (job) => {
        if (group) {
          setGroup({
            ...group,
            training_status: job.status === "completed" ? "ready" : "training",
            latest_training_job: job,
          });
        }
      },
    });
    setWebsocket(ws);
  };

  const handleStartTraining = async () => {
    try {
      const job = await sharedModelService.startTraining(groupId);
      if (group) {
        setGroup({
          ...group,
          training_status: "training",
          latest_training_job: job,
        });
      }
    } catch (error) {
      console.error("Failed to start training:", error);
    }
  };

  if (!group) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isAdmin = group.members.some(
    (member) =>
      member.user.id === /* current user id */ 1 && member.role === "admin",
  );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" component="h1">
              {group.name}
            </Typography>
            {isAdmin && group.training_status !== "training" && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleStartTraining}
              >
                Start Training
              </Button>
            )}
          </Box>
          <Typography color="text.secondary" paragraph>
            {group.description}
          </Typography>
        </Grid>

        {/* Training Progress */}
        {group.training_status === "training" && group.latest_training_job && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <TrainingProgress job={group.latest_training_job} />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Tabs */}
        <Grid item xs={12}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
          >
            <Tab label="Overview" />
            <Tab label="Members" />
            <Tab label="Contributions" />
            <Tab label="Training History" />
          </Tabs>
        </Grid>

        {/* Tab Content */}
        <Grid item xs={12}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <TrainingMetrics
                      metrics={
                        group.latest_training_job?.training_metrics || {}
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Model Info
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Version: {group.model_version}
                      </Typography>
                      <Typography variant="body2">
                        Status: {group.training_status}
                      </Typography>
                      <Typography variant="body2">
                        Members: {group.member_count}
                      </Typography>
                      <Typography variant="body2">
                        Contributions: {group.recent_contributions?.length || 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <MemberList
              members={group.members}
              groupId={group.id}
              isAdmin={isAdmin}
              onUpdate={loadGroupDetails}
            />
          )}

          {activeTab === 2 && (
            <ContributionList
              contributions={group.recent_contributions || []}
              groupId={group.id}
              isAdmin={isAdmin}
              onUpdate={loadGroupDetails}
            />
          )}

          {activeTab === 3 && group.latest_training_job && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Latest Training Results
                </Typography>
                <TrainingMetrics
                  metrics={group.latest_training_job.training_metrics}
                  detailed
                />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SharedModelDetail;
